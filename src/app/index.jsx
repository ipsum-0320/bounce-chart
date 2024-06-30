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
  LegendComponent
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
  UniversalTransition
]);

const disabledDate = (current) => {
  return current && current < dayjs('2024-05-15').endOf('day');
};

const messageKey = "REQUEST";

function App() {
  const correlationContainer = useRef();
  const [messageApi, contextHolder] = message.useMessage();
  const [isRequest, setRequest] = useState(false);

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
      messageKey,
      type: 'loading',
      content: '正在请求中...',
    });
    
    setRequest(true)
    axios.get(url, {
      params: query
    })
    .then(response => {
      setRequest(false)
      messageApi.open({
        messageKey,
        type: 'success',
        content: '请求成功!',
        duration: 2,
      });
      console.log(response)
    })
    .catch(error => {
      setRequest(false)
      messageApi.open({
        messageKey,
        type: 'error',
        content: '请求失败，打开控制台查看原因!',
        duration: 2,
      });
      console.log(error)
    });
  }


  let option = {
    title: {
      text: '真实值与弹性预测值对比图'
    },
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
      bottom: '3%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        boundaryGap: false,
        data: null // TODO
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
        data: [320, 332, 301, 334, 390, 330, 320]
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
        data: [820, 932, 901, 934, 1290, 1330, 1320]
      }
    ]
  };

  useEffect(() => {
    // const chart = echarts.init(correlationContainer.current, "dark");
    // chart.setOption(option);
  }, [option])

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

export default App;
