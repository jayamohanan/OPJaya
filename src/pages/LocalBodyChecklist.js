import React from 'react';
import { Link } from 'react-router-dom';

const towns = [
  "Thrithala",
  "Mezhathoor",
  "Njangattiri",
  "Maattaya",
  "West Thrithala",
  "Kodanad",
  "East Kodanad",
  "High School"
];

const sections = [
  {
    name: "Towns",
    items: ["Check 1", "Check 2", "Check 3"],
    rows: towns
  },
  {
    name: "Roads",
    items: ["Road Check 1", "Road Check 2", "Road Check 3"]
  },
  {
    name: "Bus Stops/Bus Stands",
    items: ["Bus Stop Check 1", "Bus Stop Check 2", "Bus Stop Check 3"]
  },
  {
    name: "Water Bodies",
    items: ["Water Check 1", "Water Check 2", "Water Check 3"]
  },
  {
    name: "Bin Usage",
    items: ["Usage Check 1", "Usage Check 2", "Usage Check 3"]
  },
  {
    name: "Bin Installation",
    items: ["Install Check 1", "Install Check 2", "Install Check 3"]
  },
  {
    name: "Bin Upkeep",
    items: ["Upkeep Check 1", "Upkeep Check 2", "Upkeep Check 3"]
  }
];

function getRandomStatus() {
  return Math.random() > 0.5 ? "yes" : "no";
}

function LocalBodyChecklist() {
  return (
    <div style={{ padding: 32 }}>
      <h1>Local Body Progress Checklist</h1>
      <Link to="/localbody-checklist" style={{ margin: 16, display: 'inline-block' }}>
        View Progress Checklist
      </Link>
      {sections.map(section => (
        <div key={section.name} style={{ marginBottom: 32 }}>
          <h2>{section.name}</h2>
          {section.name === "Towns" ? (
            <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
              <thead>
                <tr>
                  <th>Town</th>
                  {section.items.map(item => (
                    <th key={item}>{item}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {section.rows.map(town => (
                  <tr key={town}>
                    <td>{town}</td>
                    {section.items.map(item => {
                      const status = getRandomStatus();
                      return (
                        <td
                          key={item}
                          style={{
                            background: status === "yes" ? "#c8e6c9" : "#ffcdd2",
                            color: status === "yes" ? "green" : "red",
                            textAlign: "center"
                          }}
                        >
                          {status.toUpperCase()}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
              <thead>
                <tr>
                  {section.items.map(item => (
                    <th key={item}>{item}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {section.items.map(item => {
                    const status = getRandomStatus();
                    return (
                      <td
                        key={item}
                        style={{
                          background: status === "yes" ? "#c8e6c9" : "#ffcdd2",
                          color: status === "yes" ? "green" : "red",
                          textAlign: "center"
                        }}
                      >
                        {status.toUpperCase()}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          )}
        </div>
      ))}
    </div>
  );
}
// NOTE: No direct Supabase table/field references in this file, so no changes needed for dbSchema.js usage.

export default LocalBodyChecklist;