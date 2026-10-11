
import React, { useEffect, useState } from "react";
import { api } from "../api";

function getToday() {
  const d = new Date();

  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}

const initialForm = () => ({
  stockDate: getToday(),
  eggsCollected: "",
  damagedEggs: "0",
  notes: "",
});

const numberFormat = (value) =>
  Number(value || 0).toLocaleString("en-IN");

export default function EggStock() {
  const [summary, setSummary] = useState({
    totalCollected: 0,
    damagedEggs: 0,
    eggsSold: 0,
    availableStock: 0,
  });

  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadStock() {
    try {
      setError("");

      const [summaryData, stockData] = await Promise.all([
        api.stock.summary(),
        api.stock.list(),
      ]);

      setSummary(summaryData || {});
      setRows(Array.isArray(stockData) ? stockData : []);
    } catch (err) {
      setError(err.message || "Unable to load egg stock.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStock();
  }, []);

  function updateForm(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  const collected = Number(form.eggsCollected || 0);
  const damaged = Number(form.damagedEggs || 0);
  const goodEggs = Math.max(0, collected - damaged);

  async function saveStock(e) {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!form.stockDate) {
      setError("Please select the collection date.");
      return;
    }

    if (
      form.eggsCollected === "" ||
      !Number.isInteger(collected) ||
      collected <= 0
    ) {
      setError("Enter a positive whole number of eggs collected.");
      return;
    }

    if (
      !Number.isInteger(damaged) ||
      damaged < 0 ||
      damaged > collected
    ) {
      setError("Damaged eggs must be between zero and eggs collected.");
      return;
    }

    setSaving(true);

    try {
      await api.stock.create({
        stockDate: form.stockDate,
        eggsCollected: collected,
        damagedEggs: damaged,
        notes: form.notes.trim(),
      });

      setMessage("Egg stock saved successfully.");
      setForm(initialForm());

      await loadStock();
    } catch (err) {
      setError(err.message || "Unable to save egg stock.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="section-head">
        <div>
          <h2>Egg stock management</h2>
          <p className="muted">
            Record daily egg collection and monitor available inventory.
          </p>
        </div>

        <button
          type="button"
          className="secondary-btn"
          onClick={loadStock}
          disabled={loading}
        >
          Refresh stock
        </button>
      </div>

      {error && <div className="alert error">{error}</div>}

      {message && <div className="alert success">{message}</div>}

      {loading ? (
        <div className="panel">
          <p className="muted">Loading stock records...</p>
        </div>
      ) : (
        <>
          {/* STOCK SUMMARY */}
          <div className="stats-grid stock-stats">
            <StockCard
              label="Total collected"
              value={summary.totalCollected}
              icon="🥚"
              color="green"
            />

            <StockCard
              label="Damaged eggs"
              value={summary.damagedEggs}
              icon="⚠️"
              color="amber"
            />

            <StockCard
              label="Eggs sold"
              value={summary.eggsSold}
              icon="📦"
              color="blue"
            />

            <StockCard
              label="Available stock"
              value={summary.availableStock}
              icon="✓"
              color="green"
            />
          </div>

          <div className="two-col">
            {/* ADD STOCK FORM */}
            <form
              className="panel form-panel"
              onSubmit={saveStock}
            >
              <div className="panel-head">
                <div>
                  <h3>Record egg collection</h3>
                  <p className="muted">
                    Enter the eggs collected on a particular day.
                  </p>
                </div>
              </div>

              <Field label="Collection date">
                <input
                  className="input"
                  type="date"
                  value={form.stockDate}
                  onChange={(e) =>
                    updateForm("stockDate", e.target.value)
                  }
                  required
                />
              </Field>

              <Field label="Number of eggs collected">
                <input
                  className="input"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Example: 5000"
                  value={form.eggsCollected}
                  onChange={(e) =>
                    updateForm("eggsCollected", e.target.value)
                  }
                  required
                />
              </Field>

              <Field label="Damaged eggs">
                <input
                  className="input"
                  type="number"
                  min="0"
                  step="1"
                  value={form.damagedEggs}
                  onChange={(e) =>
                    updateForm("damagedEggs", e.target.value)
                  }
                  required
                />
              </Field>

              <Field label="Notes (optional)">
                <textarea
                  className="input textarea"
                  placeholder="Example: Morning collection"
                  value={form.notes}
                  onChange={(e) =>
                    updateForm("notes", e.target.value)
                  }
                />
              </Field>

              <div className="calc-box">
                <div className="summary-row">
                  <span>Collected</span>
                  <b>{numberFormat(collected)}</b>
                </div>

                <div className="summary-row">
                  <span>Damaged</span>
                  <b>{numberFormat(damaged)}</b>
                </div>

                <div className="summary-row strong">
                  <span>Good eggs from this entry</span>
                  <b>{numberFormat(goodEggs)}</b>
                </div>
              </div>

              <button
                className="primary-btn full"
                type="submit"
                disabled={saving}
              >
                {saving ? "Saving stock..." : "Save egg stock"}
              </button>
            </form>

            {/* STOCK HISTORY */}
            <div className="panel">
              <div className="panel-head">
                <div>
                  <h3>Stock history</h3>
                  <p className="muted">
                    {rows.length} collection record(s)
                  </p>
                </div>
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Collected</th>
                      <th>Damaged</th>
                      <th>Good eggs</th>
                    </tr>
                  </thead>

                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.id}>
                        <td>{row.stockDate}</td>
                        <td>{numberFormat(row.eggsCollected)}</td>
                        <td>{numberFormat(row.damagedEggs)}</td>
                        <td>
                          {numberFormat(
                            Number(row.eggsCollected || 0) -
                              Number(row.damagedEggs || 0)
                          )}
                        </td>
                      </tr>
                    ))}

                    {rows.length === 0 && (
                      <tr>
                        <td colSpan="4" className="empty">
                          No stock records found. Add your first collection.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StockCard({ label, value, icon, color }) {
  return (
    <div className={`stat-card ${color || ""}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">
        {numberFormat(value)}
      </div>
      <div className="stock-unit">eggs</div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="field">
      <label>{label}</label>
      {children}
    </div>
  );
}
