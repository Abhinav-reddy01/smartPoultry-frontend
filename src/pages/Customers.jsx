import React, {
  useEffect,
  useState,
} from 'react';

import { api } from '../api';

const blank = {
  name: '',
  phone: '',
  address: '',
};

export default function Customers() {

  const [rows, setRows] =
    useState([]);

  const [form, setForm] =
    useState(blank);

  const [editing, setEditing] =
    useState(null);

  const [error, setError] =
    useState('');

  const load = () => {

    api.customers
      .list()
      .then(setRows)
      .catch((e) =>
        setError(e.message)
      );

  };

  useEffect(() => {
    load();
  }, []);

  const save = async (e) => {

    e.preventDefault();

    try {

      if (editing) {

        await api.customers.update(
          editing,
          form
        );

      } else {

        await api.customers.create(form);

      }

      setForm(blank);
      setEditing(null);

      load();

    } catch (e) {

      setError(e.message);

    }
  };

  const edit = (row) => {

    setEditing(row.id);

    setForm({
      name: row.name || '',
      phone: row.phone || '',
      address: row.address || '',
    });

  };

  const remove = async (id) => {

    if (
      !window.confirm(
        'Delete this customer?'
      )
    ) {
      return;
    }

    try {

      await api.customers.remove(id);

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
            Customer management
          </h2>

          <p className="muted">
            Maintain customers who purchase
            eggs from the farm.
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

          <div className="panel-head">

            <div>

              <h3>
                {editing
                  ? 'Edit customer'
                  : 'Add customer'}
              </h3>

            </div>

          </div>

          <Field label="Customer name">

            <input
              className="input"
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
              required
            />

          </Field>

          <Field label="Phone">

            <input
              className="input"
              value={form.phone}
              onChange={(e) =>
                setForm({
                  ...form,
                  phone: e.target.value,
                })
              }
            />

          </Field>

          <Field label="Address">

            <textarea
              className="input textarea"
              value={form.address}
              onChange={(e) =>
                setForm({
                  ...form,
                  address:
                    e.target.value,
                })
              }
            />

          </Field>

          <div className="button-row">

            <button
              className="primary-btn"
              type="submit"
            >
              {editing
                ? 'Update customer'
                : 'Save customer'}
            </button>

            {editing && (
              <button
                className="secondary-btn"
                type="button"
                onClick={() => {

                  setEditing(null);
                  setForm(blank);

                }}
              >
                Cancel
              </button>
            )}

          </div>

        </form>

        <div className="panel">

          <div className="panel-head">

            <div>

              <h3>
                Customers
              </h3>

              <p className="muted">
                {rows.length} customer(s)
              </p>

            </div>

          </div>

          <div className="table-wrap">

            <table>

              <thead>

                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Actions</th>
                </tr>

              </thead>

              <tbody>

                {rows.map((row) => (

                  <tr key={row.id}>

                    <td>
                      {row.name}
                    </td>

                    <td>
                      {row.phone || '-'}
                    </td>

                    <td>
                      {row.address || '-'}
                    </td>

                    <td>

                      <button
                        className="table-btn"
                        onClick={() =>
                          edit(row)
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="table-btn danger-text"
                        onClick={() =>
                          remove(row.id)
                        }
                      >
                        Delete
                      </button>

                    </td>

                  </tr>

                ))}

                {rows.length === 0 && (
                  <tr>

                    <td
                      colSpan="4"
                      className="empty"
                    >
                      No customers found.
                    </td>

                  </tr>
                )}

              </tbody>

            </table>

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