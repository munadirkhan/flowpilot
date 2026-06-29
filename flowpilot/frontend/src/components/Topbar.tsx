import { moneyWhole } from "../lib/format";

export function Topbar({
  leadsToday,
  awaiting,
  pipeline,
  onNew,
}: {
  leadsToday: number;
  awaiting: number;
  pipeline: number;
  onNew: () => void;
}) {
  return (
    <div className="topbar">
      <div className="stats">
        <div className="stat">
          <div className="k">Leads today</div>
          <div className="v">{leadsToday}</div>
        </div>
        <div className="stat">
          <div className="k">Awaiting you</div>
          <div className="v amber">{awaiting}</div>
        </div>
        <div className="stat">
          <div className="k">Confirmed pipeline</div>
          <div className="v">
            <span className="serif emerald">{moneyWhole(pipeline)}</span>
          </div>
        </div>
      </div>
      <button className="pill" onClick={onNew}>+ New inquiry</button>
    </div>
  );
}
