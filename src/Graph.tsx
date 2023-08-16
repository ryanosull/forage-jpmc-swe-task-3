import React, { Component } from 'react';
import { Table, TableData } from '@finos/perspective';
import { ServerRespond } from './DataStreamer';
import { DataManipulator } from './DataManipulator';
import './Graph.css';

interface IProps {
  data: ServerRespond[],
}

interface PerspectiveViewerElement extends HTMLElement {
  load: (table: Table) => void,
}
class Graph extends Component<IProps, {}> {
  table: Table | undefined;

  render() {
    return React.createElement('perspective-viewer');
  }

  componentDidMount() {
    // Get element from the DOM.
    const elem = document.getElementsByTagName('perspective-viewer')[0] as unknown as PerspectiveViewerElement;

    const schema = { // configures Perspective table view of graph - modified ↓
      price_abc: 'float', //price, for ratio (price not shown in graph)
      price_def: 'float', //price, for ratio (price not shown in graph)
      ratio: 'float', //track ratios of two stocks
      timestamp: 'date', //timestamp | FYI: tracking +/-10% of the 12-month historical average ratio (as per pg 5, task 3 in Forage)
      upper_bound: 'float', //upper
      lower_bound: 'float', //lower
      trigger_alert: 'float', //moment when upper or lower bound is crossed
    };

    if (window.perspective && window.perspective.worker()) {
      this.table = window.perspective.worker().table(schema);
    }
    if (this.table) {
      // Load the `table` in the `<perspective-viewer>` DOM reference.
      elem.load(this.table);
      elem.setAttribute('view', 'y_line');  // y_line graph
      elem.setAttribute('row-pivots', '["timestamp"]');   // x-axis 
      elem.setAttribute('columns', '["ratio", "lower_bound", "upper_bound", "trigger_alert"]'); // y-axis 
      elem.setAttribute('aggregates', JSON.stringify({   // modified ↓ - handle duplicate data; data only unique if timestamp, otherwise avg values
        price_abc: 'avg',
        price_def: 'avg',
        ratio: 'avg',
        timestamp: 'distinct count', //keep me
        upper_bound: 'avg',
        lower_bound: 'avg',
        trigger_alert: 'avg',
      }));
    }
  }

  componentDidUpdate() {
    if (this.table) {
      this.table.update([
        DataManipulator.generateRow(this.props.data),
      ] as unknown as TableData);
    }
  }
}

export default Graph;
