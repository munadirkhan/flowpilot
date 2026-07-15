// Mic capture → 16 kHz mono WAV blob. Uses Web Audio so we control the format
// (Qwen ASR reliably accepts WAV; MediaRecorder's webm/opus is less predictable).

export interface Recorder {
  stop: () => Promise<Blob>;
}

export async function startRecording(): Promise<Recorder> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const ctx = new AudioContext();
  const source = ctx.createMediaStreamSource(stream);
  const proc = ctx.createScriptProcessor(4096, 1, 1);
  const chunks: Float32Array[] = [];

  proc.onaudioprocess = (e) => {
    chunks.push(new Float32Array(e.inputBuffer.getChannelData(0)));
  };
  source.connect(proc);
  proc.connect(ctx.destination);

  return {
    stop: async () => {
      proc.disconnect();
      source.disconnect();
      stream.getTracks().forEach((t) => t.stop());
      const inputRate = ctx.sampleRate;
      await ctx.close();

      // Merge chunks
      const total = chunks.reduce((n, c) => n + c.length, 0);
      const pcm = new Float32Array(total);
      let off = 0;
      for (const c of chunks) {
        pcm.set(c, off);
        off += c.length;
      }
      // Downsample to 16 kHz and encode WAV
      const rate = 16000;
      const ratio = inputRate / rate;
      const outLen = Math.floor(pcm.length / ratio);
      const out = new Float32Array(outLen);
      for (let i = 0; i < outLen; i++) out[i] = pcm[Math.floor(i * ratio)];
      return encodeWav(out, rate);
    },
  };
}

function encodeWav(samples: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const writeStr = (o: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i));
  };
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, samples.length * 2, true);
  let o = 44;
  for (let i = 0; i < samples.length; i++, o += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(o, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return new Blob([view], { type: "audio/wav" });
}
