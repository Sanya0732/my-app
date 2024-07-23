import React from 'react';
import { TreeTable, TreeState } from 'cp-react-tree-table';
import { read, utils } from 'xlsx';
import fuzzysearch from 'fuzzysearch';

export default class Demo extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      treeValue: TreeState.create([]),
      searchTerm: ''
    };
  }

  handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const json = utils.sheet_to_json(sheet);

      const structuredData = this.structureData(json);
      this.setState({ treeValue: TreeState.create(structuredData) });
    };

    reader.readAsArrayBuffer(file);
  };

  structureData = (data) => {
    const map = {};
    const roots = [];

    data.forEach((item) => {
      const node = {
        data: {
          name: item.name,
          expenses: item.expenses,
          employees: item.employees,
          contact: item.contact,
        },
        children: [],
      };

      map[item.name] = node;

      if (item.parent) {
        const parent = map[item.parent];
        if (parent) {
          parent.children.push(node);
        }
      } else {
        roots.push(node);
      }
    });

    return roots;
  };

  handleSearch = (event) => {
    const searchTerm = event.target.value;
    this.setState({ searchTerm }, this.filterTree);
  };

  filterTree = () => {
    const { searchTerm, treeValue } = this.state;
    if (treeValue && treeValue.treeData) {
      const filteredData = this.filterNodes(treeValue.treeData, searchTerm);
      this.setState({ treeValue: TreeState.create(filteredData) });
    }
  };

  filterNodes = (nodes = [], searchTerm) => {
    return nodes
      .map(node => {
        if (node.children) {
          const filteredChildren = this.filterNodes(node.children, searchTerm);
          if (filteredChildren.length > 0 || this.matchesSearchTerm(node.data, searchTerm)) {
            return { ...node, children: filteredChildren };
          }
        } else if (this.matchesSearchTerm(node.data, searchTerm)) {
          return node;
        }
        return null;
      })
      .filter(node => node !== null);
  };

  matchesSearchTerm = (data, searchTerm) => {
    return fuzzysearch(searchTerm.toLowerCase(), data.name.toLowerCase()) ||
      fuzzysearch(searchTerm.toLowerCase(), data.contact.toLowerCase());
  };

  handleOnChange = (newValue) => {
    this.setState({ treeValue: newValue });
  };

  renderIndexCell = (row) => {
    return (
      <div style={{ paddingLeft: (row.metadata.depth * 15) + 'px' }}
        className={row.metadata.hasChildren ? 'with-children' : 'without-children'}>

        {row.metadata.hasChildren && (
          <button className="toggle-button" style={{
            background: 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJUAAACUCAMAAACtIJvYAAAAWlBMVEX///8AAAD8/PzT09MzMzPg4OArKyuXl5fQ0NCoqKgwMDDY2NiUlJQ3NzfMzMyhoaGLi4smJiYYGBghISHz8/PBwcGurq5CQkK3t7dubm7n5+cODg6EhIQ8PDz+zmZ6AAAB/UlEQVR4nO2Z/2KCIBSFRWNRNrRfa7X2/q+5DJNb1hK4oH+c7wFOx/shomUZAAAAAAAAAAAAAAAAAAAAAABMlVxWC8mauNvP97uwiLwWF75ynkIN6nAJPJyCMr7FlQVTpSyTy2vgMeg6D6aVmDOVUjOTt9YhKcu2lViwSFSfbdxmHxJzFF0thlJydkv7DLqDTuuuVrhE1U1eVGFJ2iaFSuz0CXEOS8qyQthaQUFWnziHL9LSSlwFxOgPxrVwn+cvkVOfgUEi0VdzPShKOy0/idz6eqk+Egurr+YrdZmWlei+1ZSkFONzvkm2+5argzj6DMpmV04XXJCFzl3KW2I8fYbCR6L2Nz8QtXaeVlx9BmeJpNQqhr7erwzxEV+fQW0dpkUWYjR9BiLx3eVTfXFL3T09/q+l3WwHMlAieaJH1meQPwOGoBItdMsAiWn1tbU2bySm1meQttaz2yu9PgOV2Nu0dcIt4aGWXfKPEpleiryQ2xe/TQ55gW/IPhCJ9Bg4nr621jOJL0eYDGkX0O3+1+5HMHZ6EsfWZ3g4Bo6vzyDpJq5dDl9RIRLPv9OYVAOROJ1S3bdqwsj6DETiVCbVUE6x1N03s2noM9jXmclMqkG2pZIe8t4jr5sV379QTMjqWAf9OROJPN73DQAAAAAAAAAAAAAAAAAAAAAASM8f70cOuVWBzEsAAAAASUVORK5CYII=") no-repeat',
            backgroundSize: 'contain', // Adjust as needed
            border: 'none', // Optional: Remove default border
            width: '20px', // Adjust as needed
            height: '20px' // Adjust as needed
          }} onClick={row.toggleChildren}></button>
        )}

        <span>{row.data.name}</span>
      </div>
    );
  }

  renderEmployeesCell = (row) => {
    return (
      <span className="employees-cell">{row.data.employees}</span>
    );
  }

  renderExpensesCell = (row) => {
    return (
      <span className="expenses-cell">{row.data.expenses}</span>
    );
  }

  renderEditableCell = (row) => {
    return (
      <input type="text" value={row.data.contact}
        onChange={(event) => {
          row.updateData({
            ...row.data,
            contact: event.target.value,
          });
        }} />
    );
  }

  render() {
    const { treeValue, searchTerm } = this.state;

    return (
      <div>
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={this.handleFileUpload}
          style={{ marginBottom: '10px' }}
        />
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={this.handleSearch}
          style={{ marginBottom: '10px', padding: '5px', width: '100%' }}
        />
        <TreeTable
          className="tree-table"
          value={treeValue}
          onChange={this.handleOnChange}>
          <TreeTable.Column basis="180px" grow="0"
            renderCell={this.renderIndexCell}
            renderHeaderCell={() => <span>Name</span>} />
          <TreeTable.Column
            renderCell={this.renderEditableCell}
            renderHeaderCell={() => <span>Contact person</span>} />
          <TreeTable.Column
            renderCell={this.renderEmployeesCell}
            renderHeaderCell={() => <span className="t-right">Employees</span>} />
          <TreeTable.Column
            renderCell={this.renderExpensesCell}
            renderHeaderCell={() => <span className="t-right">Expenses ($)</span>} />
        </TreeTable>
      </div>
    );
  }
}
