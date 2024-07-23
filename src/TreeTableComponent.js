// src/TreeTableComponent.js

import React from 'react';
import { TreeTable, TreeState } from 'cp-react-tree-table';

const TreeTableComponent = () => {
  const [treeState, setTreeState] = React.useState(TreeState.create(genData()));

  // Render cell for each column
  const renderCell = (column) => {
    return (row) => {
      // Render data for current row
      const cellData = row.data[column];

      // If the row has children, you might want to render child data as well
      if (row.children && row.children.length > 0) {
        return (
          <div>
            <div>{cellData}</div>
            <ul>
              {row.children.map(child => (
                <li key={child.data.name}>
                  {child.data.name} - {child.data.expenses} - {child.data.employees} - {child.data.contact}
                </li>
              ))}
            </ul>
          </div>
        );
      }
      
      return <span>{cellData}</span>;
    };
  };

  return (
    <TreeTable
      value={treeState}
      onChange={setTreeState}
    >
      <TreeTable.Column
        renderCell={renderCell('name')}
        renderHeaderCell={() => <span>Name</span>}
      />
      <TreeTable.Column
        renderCell={renderCell('contact')}
        renderHeaderCell={() => <span>Contact</span>}
      />
      <TreeTable.Column
        renderCell={renderCell('employees')}
        renderHeaderCell={() => <span className="t-right">Employees</span>}
      />
      <TreeTable.Column
        renderCell={renderCell('expenses')}
        renderHeaderCell={() => <span className="t-right">Expenses ($)</span>}
      />
    </TreeTable>
  );
};

export default TreeTableComponent;

function genData() {
  // Define and return hierarchical data here as needed
}
