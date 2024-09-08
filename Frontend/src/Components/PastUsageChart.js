import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const getXLabel = (currTime) => {
  let curr_month = parseInt(currTime.slice(0, 2)) - 1;
  if (curr_month === 0) {
    curr_month = 12
  }
  let curr_year = parseInt(currTime.slice(3)) - 1;
  curr_month = String(curr_month).padStart(2, '0')
  curr_year = String(curr_year)
  let xLabels = [`${curr_month}-${curr_year}`]
  for (let i = 0; i < 12; i++) {
    curr_month = parseInt(curr_month) + 1
    curr_year = parseInt(curr_year)
    if (curr_month === 13) {
      curr_month = 1
      curr_year += 1
    }
    curr_month = String(curr_month).padStart(2, '0')
    curr_year = String(curr_year)
    xLabels.push(`${curr_month}-${curr_year}`)
  }
  return xLabels
}

const PastUsageChart = ({ pastUsage, currTime, name }) => {
  const data = {
    labels: getXLabel(currTime), 
    datasets: [
      {
        label: name,
        data: pastUsage.map(value => value * 100),  
        borderColor: 'rgba(255, 99, 132, 1)',
        fill: false,
        tension: 0,  
      }
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            family: 'Poppins',
            size: 14
          },
        },
      },
      title: {
        display: true,
        text: 'Pokemon Usage Over Time',
        font: {
          family: 'Poppins',
          size: 18,
          weight: 'bold',
        },
      },
      
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)', 
      },
    },
    layout: {
      padding: {
        top: 10,
        bottom: 10,
        left: 10,
        right: 10,
      },
    },
    elements: {
      line: {
        backgroundColor: 'rgba(255, 255, 255, 1)', 
      },
      point: {
        backgroundColor: 'rgba(255, 255, 255, 1)', 
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Months',
          font: {
            family: 'Poppins',
            size: 14,
            weight: 'normal',
          },
        },
        ticks: {
          font: {
            family: 'Poppins',
            size: 12
          },
        },
      },
      y: {
        beginAtZero: true,
        min: 0,
        max: 100,
        title: {
          display: true,
          text: 'Usage (%)',
          font: {
            family: 'Poppins',
            size: 14,
            weight: 'normal',
          },
        },
        ticks: {
          font: {
            family: 'Poppins',
            size: 12,
            weight: 'bold',
          },
          stepSize: 5,
          precision: 2 
        },
      },
    },
    backgroundColor: 'white',
  };
  
  return <Line data={data} options={options}/>;
};

export default PastUsageChart;
