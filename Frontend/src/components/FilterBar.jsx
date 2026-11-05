// FilterBar.jsx — filtros por tipo (chips) e ordenação.

import { FILTERS, SORTS, typeColor } from "../lib/fileTypes";

export default function FilterBar({ activeType, setActiveType, sort, setSort }) {
  return (
    <div className="filters">
      {FILTERS.map((f) => (
        <button
          key={f.key}
          className={`chip ${activeType === f.key ? "on" : ""}`}
          onClick={() => setActiveType(f.key)}
        >
          {f.key !== "all" && (
            <i className="dot" style={{ background: typeColor(f.key), color: typeColor(f.key) }} />
          )}
          {f.label}
        </button>
      ))}

      <div className="sortbar">
        Ordenar
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          {SORTS.map((s) => (
            <option key={s.key} value={s.key}>{s.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
