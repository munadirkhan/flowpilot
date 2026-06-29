# FlowPilot — Alibaba Cloud (ECS) Deployment

One Docker container serves the whole app (FastAPI API + bundled React frontend)
on port 80. End result: a public URL judges can click, with FlowPilot's agents
running on **Qwen Cloud**.

---

## Part A — What YOU do (Alibaba Cloud account + server)

> Do this once. ~20–30 min. ECS is not free, but a tiny burstable instance is
> a few cents/hour — destroy it after judging.

1. **Create an account** at <https://www.alibabacloud.com> (International).
   Verify email + phone, add a payment method (required to launch ECS).

2. **Launch an ECS instance** (Elastic Compute Service → Create Instance):
   - **Region:** Singapore (matches the `dashscope-intl` Qwen endpoint → low latency)
   - **Instance type:** smallest burstable, e.g. `ecs.e-c1m2.large` (2 vCPU / 2 GB) — 2 GB RAM is plenty since inference runs on Qwen Cloud, not the box
   - **Image:** Ubuntu 24.04 64-bit
   - **Public IP:** Assign / enable (pay-as-you-go traffic)
   - **Key pair or password:** set one so you can SSH in
   - **System disk:** 40 GB default is fine

3. **Open the firewall** (Security Group → add inbound rules):
   - TCP **80** from `0.0.0.0/0`  (the app)
   - TCP **22** from your IP only  (SSH)

4. **Note the public IP** of the instance (e.g. `47.x.x.x`).

5. **Tell me:** the public IP, and confirm you can SSH in
   (`ssh root@<public-ip>`). I'll hand you the exact copy-paste block for Part B.

---

## Part B — What WE run on the server (I'll give you these verbatim)

SSH in (`ssh root@<public-ip>`), then:

```bash
# 1. Install Docker + compose plugin
curl -fsSL https://get.docker.com | sh

# 2. Get the code (after the repo is pushed to GitHub)
git clone https://github.com/<your-username>/flowpilot.git
cd flowpilot/flowpilot          # repo root → project folder with the Dockerfile

# 3. Build + run, passing the Qwen Cloud key as an env var (NOT baked into the image)
QWEN_API_KEY="sk-ws-...your-key..." docker compose up -d --build

# 4. Seed the demo inbox (6 leads)
docker compose exec flowpilot python seed_demo.py

# 5. Check it's healthy
curl localhost/health        # -> {"status":"ok","model":"qwen3.7-max"}
```

Then open **`http://<public-ip>`** in a browser — the full FlowPilot app, live,
agents running on Qwen Cloud. That's your **Alibaba Cloud proof**.

> No GitHub yet? Copy the folder up instead of `git clone`:
> `scp -r flowpilot root@<public-ip>:~/` from your machine, then `cd flowpilot/flowpilot`.

---

## Notes
- **Secrets:** the `QWEN_API_KEY` is passed at `docker compose up` time and lives
  only in the server's environment — it is never committed or baked into the image
  (`.dockerignore` excludes `.env`).
- **Data:** the SQLite DB is inside the container (resets if the container is
  recreated). Re-run the seed command after a rebuild. Fine for a demo.
- **Cost control:** **stop or release the ECS instance** once judging is done.
- **Proof to capture for Devpost:** a screenshot of the ECS console showing the
  running instance + the app loaded at `http://<public-ip>`, and/or a short screen
  recording of submitting an inquiry on the public URL.
