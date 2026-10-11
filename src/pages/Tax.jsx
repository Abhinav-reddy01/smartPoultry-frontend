import React, {
  useEffect,
  useState,
} from 'react';

import { api } from '../api';

export default function Tax() {

  const [rows, setRows] =
    useState([]);

  const [selected, setSelected] =
    useState(null);

  const [form, setForm] =
    useState({
      taxName: 'Configured Tax',
      taxRate: '0',
    });

  const [error, setError] =
    useState('');

  const load = () => {

    api.tax
      .list()
      .then((data) => {

        setRows(data || []);

        if (
          data &&
          data.length > 0
        ) {

          setSelected(data[0]);

          setForm({
            taxName:
              data[0].taxName ||
              'Configured Tax',

            taxRate:
              String(
                data[0].taxRate ?? 0
              ),
          });
        }

      })
      .catch((e) =>
        setError(e.message)
      );
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (e) => {

    e.preventDefault();

    if (!selected) {

      setError(
        'No tax setting was returned by the backend.'
      );

      return;
    }

    try {

      await api.tax.update(
        selected.id,
        {
          taxName:
            form.taxName,

          taxRate:
            Number(form.taxRate),
        }
      );

      load();

    } catch (e) {

      setError(e.message);

    }
  };

  return (
    <div>

      <div className="section-head">

        <div>

          <h2>
            Tax management
          </h2>

          <p className="muted">
            Configure the tax rate used
            by the application.
          </p>

        </div>

      </div>

      {error && (
        <div className="alert error">
          {error}
        </div>
      )}

      <div className="two-col">

        <form
          className="panel form-panel"
          onSubmit={save}
        >

          <h3>
            Tax settings
          </h3>

          <Field label="Tax name">

            <input
              className="input"
              value={form.taxName}
              onChange={(e) =>
                setForm({
                  ...form,
                  taxName:
                    e.target.value,
                })
              }
            />

          </Field>

          <Field label="Tax rate %">

            <input
              className="input"
              type="number"
              min="0"
              step="0.01"
              value={form.taxRate}
              onChange={(e) =>
                setForm({
                  ...form,
                  taxRate:
                    e.target.value,
                })
              }
            />

          </Field>

          <button className="primary-btn full">
            Save tax settings
          </button>

        </form>

        <div className="panel">

          <div className="panel-head">

            <div>

              <h3>
                Current configuration
              </h3>

              <p className="muted">
                Tax is configurable for your application.
              </p>

            </div>

          </div>

          <div className="summary-list">

            <SummaryRow
              label="Tax name"
              value={
                form.taxName || '-'
              }
            />

            <SummaryRow
              label="Tax rate"
              value={`${form.taxRate || 0}%`}
              strong
            />

            <div className="info-box">

              Tax rules can vary by
              transaction and applicable
              law. Keep the rate configurable
              rather than assuming a universal
              rate.

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

function Field({
  label,
  children,
}) {

  return (
    <div className="field">

      <label>
        {label}
      </label>

      {children}

    </div>
  );
}

function SummaryRow({
  label,
  value,
  strong,
}) {

  return (
    <div
      className={`summary-row ${
        strong ? 'strong' : ''
      }`}
    >

      <span>
        {label}
      </span>

      <b>
        {value}
      </b>

    </div>
  );
}