import { Component, OnInit, OnDestroy } from '@angular/core';
import * as echarts from 'echarts';
import { HttpClient, HttpHeaders } from "@angular/common/http";

@Component({
  selector: 'app-personal-center',
  templateUrl: './personal-center.component.html',
  styleUrls: ['./personal-center.component.css']
})
export class PersonalCenterComponent implements OnInit, OnDestroy {
  currentChart: echarts.ECharts | null = null;

  constructor(public http: HttpClient) { }

  ngOnDestroy() {
    // 在组件销毁时销毁当前的图表实例
    if (this.currentChart) {
      this.currentChart.dispose();
      this.currentChart = null;
    }
  }
  ngOnInit() {
    let lineData;
    /*sessionStorage.setItem("token",'123456');*/
    type EChartsOption = echarts.EChartsOption;
    const chartDom = document.getElementById('line')!;
    const myChart = echarts.init(chartDom);
    let option: EChartsOption;
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' ,'token':localStorage.getItem("token")!})
    };
    /*console.log(httpOptions);*/
    const api = "/person/line";
    //获取数据需先把设置测试数据删去并把注释内容放出
    this.http.get(api,httpOptions).subscribe((res:any) => {
      if(res.success){
        lineData=res.data;
      }
    });

    option = {
      title: {
        text: '本周学习时长'
      },
      xAxis: {
        type: 'category',
        name: '日期',
        data:  ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      },
      yAxis: {
        type: 'value',
        name:'学习时长/h',
      },
      series: [
        {
          data: /*lineData*/[2, 3, 0, 5, 7, 0, 10],
          type: 'line',
        }
      ]
    };
    option && myChart.setOption(option);

    const chartDom2 = document.getElementById('pie')!;
    const myChart2 = echarts.init(chartDom2);
    let option2: EChartsOption;
    let pieData;
    const api2 = "/person/pie";
    this.http.get(api2,httpOptions).subscribe((res:any) => {
      if(res.success){
        pieData=res.data;
      }
    });

    option2 = {
      title: {
        text: '学习内容',
        subtext: '每天0点更新数据',
        left: 'center'
      },
      tooltip: {
        trigger: 'item'
      },
      legend: {
        orient: 'vertical',
        left: 'left'
      },
      series: [
        {
          name: 'Access From',
          type: 'pie',
          radius: '50%',
          data: /*pieData*/
            [
            { value: 60, name: '高等数学' },
            { value: 55, name: 'c++' },
            { value: 300, name: '日本文化' },
            { value: 30, name: '虚拟现实' },
            { value: 9, name: '诗词赏析' }
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    };

    option && myChart2.setOption(option2);

    const chartDom3 = document.getElementById('radar')!;
    const myChart3 = echarts.init(chartDom3);
    let option3: EChartsOption;

    const api3 = "/person/rader";
    let radarData;
    this.http.get(api3,httpOptions).subscribe((res:any) => {
      if (res.success) {
        radarData = res.data;
      }
    });

    option3 = {
      title: {
        text: '均值对比'
      },
      legend: {
        data: ['平均数据', '个人数据']
      },
      radar: {
        // shape: 'circle',
        indicator: [
          { name: '学习时长', max: 1000 },
          { name: '成绩', max: 160 },
          { name: '活跃度', max: 300 },
          { name: '互动量', max: 38 },
          { name: '等级', max: 52 },
          { name: '肝度', max: 25 }
        ]
      },
      series: [
        {
          name: 'Budget vs spending',
          type: 'radar',
          data: [
            {
              value: [420, 30, 200, 35, 50, 18],
              name: '平均数据'
            },
            {
              value: /*radarData*/[500, 140, 280, 26, 42, 21],
              name: '个人数据'
            }
          ]
        }
      ]
    };

    option && myChart3.setOption(option3);

    const chartDom4 = document.getElementById('bar')!;
    const myChart4 = echarts.init(chartDom4);
    let option4: EChartsOption;

    const api4 = "/person/bar";
    let barData;
    this.http.get(api4,httpOptions).subscribe((res:any) => {
      if (res.success) {
        barData = res.data;
      }
    });

    option4 = {
      title: {
        text: '课程学习数量'
      },
      xAxis: {
        type: 'category',
        name:'课程类别',
        data: ['Math', 'English', 'computer', 'science', 'technology', 'history', 'game']
      },
      yAxis: {
        name: '数量',
        type: 'value'
      },
      series: [
        {
          data: /*barData*/[9, 2, 15, 3, 6, 1, 4],
          type: 'bar',
          showBackground: true,
          backgroundStyle: {
            color: 'rgba(180, 180, 180, 0.2)'
          }
        }
      ]
    };

    option && myChart4.setOption(option4);


  }


  logout(){
    const flag = confirm("确认退出登录？");
    if(flag){
      localStorage.setItem("token","");
      window.location.href = '/index';
    }
  }

  loadLineChart() {
    if (this.currentChart) {
      this.currentChart.dispose();
      this.currentChart = null;
    }
    const chartDom = document.getElementById('line')!;
    this.currentChart = echarts.init(chartDom);
    /*const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json', token: localStorage.getItem('token')! })
    };
    const api = '/person/line';

    this.http.get(api, httpOptions).subscribe((res: any) => {
      if (res.success) {
        const lineData = res.data;*/
        const option = {
          title: {
            text: '本周学习时长'
          },
          xAxis: {
            type: 'category',
            name: '日期',
            data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
          },
          yAxis: {
            type: 'value',
            name: '学习时长/h'
          },
          series: [
            {
              data: [2, 3, 0, 5, 7, 0, 10],
              type: 'line'
            }
          ]
        };
      this.currentChart.setOption(option);
      }
/*
    });
  }
*/

  loadPieChart() {
    if (this.currentChart) {
      this.currentChart.dispose();
      this.currentChart = null;
    }
    const chartDom = document.getElementById('pie')!;
    this.currentChart = echarts.init(chartDom);
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json', token: localStorage.getItem('token')! })
    };
   /* const api = '/person/pie';

    this.http.get(api, httpOptions).subscribe((res: any) => {
      if (res.success) {
        const pieData = res.data;*/
        const option = {
          title: {
            text: '学习内容',
            subtext: '每天0点更新数据',
            left: 'center'
          },
          tooltip: {
            trigger: 'item'
          },
          legend: {
            orient: 'vertical',
            left: 'left'
          },
          series: [
            {
              name: 'Access From',
              type: 'pie',
              radius: '50%',
              data:  [
                { value: 60, name: '高等数学' },
                { value: 55, name: 'c++' },
                { value: 300, name: '日本文化' },
                { value: 30, name: '虚拟现实' },
                { value: 9, name: '诗词赏析' }
              ],
              emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
              }
            }
          ]
        };
      this.currentChart.setOption(option);
      }
/*
    });
  }
*/

  loadRadarChart() {
    if (this.currentChart) {
      this.currentChart.dispose();
      this.currentChart = null;
    }
    const chartDom = document.getElementById('radar')!;
    this.currentChart = echarts.init(chartDom);
/*    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json', token: localStorage.getItem('token')! })
    };
    const api = '/person/radar';

    this.http.get(api, httpOptions).subscribe((res: any) => {
      if (res.success) {
        const radarData = res.data;*/
        const option = {
          title: {
            text: '均值对比'
          },
          legend: {
            data: ['平均数据', '个人数据']
          },
          radar: {
            indicator: [
              { name: '学习时长', max: 1000 },
              { name: '成绩', max: 160 },
              { name: '活跃度', max: 300 },
              { name: '互动量', max: 38 },
              { name: '等级', max: 52 },
              { name: '肝度', max: 25 }
            ]
          },
          series: [
            {
              name: 'Budget vs spending',
              type: 'radar',
              data: [
                {
                  value: [420, 30, 200, 35, 50, 18],
                  name: '平均数据'
                },
                {
                  value: [500, 140, 280, 26, 42, 21],
                  name: '个人数据'
                }
              ]
            }
          ]
        };
        this.currentChart.setOption(option);
      }
/*    });
  }*/

  loadBarChart() {
    if (this.currentChart) {
      this.currentChart.dispose();
      this.currentChart = null;
    }
    const chartDom = document.getElementById('bar')!;
    this.currentChart = echarts.init(chartDom);
/*    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json', token: localStorage.getItem('token')! })
    };
    const api = '/person/bar';

    this.http.get(api, httpOptions).subscribe((res: any) => {
      if (res.success) {
        const barData = res.data;*/
        const option = {
          title: {
            text: '课程学习数量'
          },
          xAxis: {
            type: 'category',
            name: '课程类别',
            data: ['Math', 'English', 'computer', 'science', 'technology', 'history', 'game']
          },
          yAxis: {
            name: '数量',
            type: 'value'
          },
          series: [
            {
              data: [9, 2, 15, 3, 6, 1, 4],
              type: 'bar',
              showBackground: true,
              backgroundStyle: {
                color: 'rgba(180, 180, 180, 0.2)'
              }
            }
          ]
        };
        this.currentChart.setOption(option);
      }
/*    });
  }*/




  handleMenuSelection(menu: string ) {
    switch (menu) {
      case '学习时长':
        this.loadLineChart();
        break;
      case '学习分类':
        this.loadPieChart();
        break;
      case '课程数量':
        this.loadBarChart();
        break;
      case '学习比较':
        this.loadRadarChart();
        break;
      case '账户信息':

        break;
      case '个人信息':

        break;
      case '个人主页':

        break;
      case '敬请期待':

        break;
      default:
        break;
    }
  }
}
