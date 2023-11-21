export class ProgressStatusValueConverter{
  toView(percent: number) {
    let color = '';
    
    if (percent > 75) {
      color = 'green';
    }
    else if(percent >= 30 && percent <= 75) {
      color = 'orange';
    }
    else {
      color = 'red';
    }

    return `vm-grid-progress-${color} vm-grid-progress-status-${percent==100?'complete':'notcomplete'}`;
  }
}
