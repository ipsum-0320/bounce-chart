import styles from './index.module.css';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import * as echarts from 'echarts/core';
import {
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DataZoomComponent
} from 'echarts/components';
import { LineChart } from 'echarts/charts';
import { UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { message } from "antd";

dayjs.extend(customParseFormat);

const { RangePicker } = DatePicker;

echarts.use([
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  LineChart,
  CanvasRenderer,
  UniversalTransition,
  DataZoomComponent
]);

const disabledDate = (current) => {
  return current && current < dayjs('2024-05-15').endOf('day');
};

function App() {
  const correlationContainer = useRef();
  const [messageApi, contextHolder] = message.useMessage();
  const [isRequest, setRequest] = useState(false);
  const [refresh, setRefresh] = useState(0);

  const [T, setT] = useState(null);
  const [B, setB] = useState(null);
  const [time, setTime] = useState(null);

  function okFunc(value) {
    if (value[0] == null || value[1] == null || isRequest) return
  
    const url = "http://localhost:8081/bounce/rate";
    const start = dayjs(value[0].$d).format('YYYY-MM-DD HH:mm:ss');
    const end = dayjs(value[1].$d).format('YYYY-MM-DD HH:mm:ss');
    const query = {
      start,
      end,
    }
  
    messageApi.open({
      type: 'loading',
      content: '正在请求中...',
      duration: 999,
    });
    
    setRequest(true)
    axios.get(url, {
      params: query
    })
    .then(response => {
      messageApi.destroy()
      setRequest(false)
      messageApi.open({
        type: 'success',
        content: '请求成功!',
        duration: 2,
      });
      setT(response.data.data['true_ins'])
      setB(response.data.data['bounce_ins'])
      setTime(response.data.data['date'])
      setRefresh(refresh + 1)
    })
    .catch(error => {
      messageApi.destroy()
      setRequest(false)
      messageApi.open({
        type: 'error',
        content: '请求失败，打开控制台查看原因!',
        duration: 2,
      });
      console.log(error)
    });
  }

  useEffect(() => {
    const chart = echarts.init(correlationContainer.current, "dark");
    chart.setOption(getOption(time, T, B));
  }, [refresh])

  return (
    <div className={styles.app}>
      <div className={styles.container}>
        <div className={styles.chart}>
          <div style={{height: "100%", width: "100%"}} ref={correlationContainer}></div>
        </div>
        <div className={styles.picker}>
          {contextHolder}
          <RangePicker
            disabledDate={disabledDate}
            showTime={{ format: 'HH:mm' }}
            format="YYYY-MM-DD HH:mm"
            onOk={okFunc}
          />
          <div className={styles.metrics}>
            <div className={styles.bingo}>充足率: {100}%</div>
            <div className={styles.save}>节约率: {50}%</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getOption(time, T, B) {
  let option = {
    title: {
      text: '真实值与弹性预测值对比图'
    },
    dataZoom: [
      {
        type: 'inside'
      },
      {
        type: 'slider'
      }
    ],
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      }
    },
    legend: {
      data: ['true', 'bounce-predict']
    },
    toolbox: {
      feature: {
        saveAsImage: {}
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '60px',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        boundaryGap: false,
        data: time,
      }
    ],
    yAxis: [
      {
        type: 'value'
      }
    ],
    series: [
      {
        name: 'true',
        type: 'line',
        stack: 'Total',
        areaStyle: {},
        emphasis: {
          focus: 'series'
        },
        data: T,
      },
      {
        name: 'bounce-predict',
        type: 'line',
        stack: 'Total',
        label: {
          show: true,
          position: 'top'
        },
        areaStyle: {},
        emphasis: {
          focus: 'series'
        },
        data: B,
      }
    ]
  };
  return option;
}

export default App;
