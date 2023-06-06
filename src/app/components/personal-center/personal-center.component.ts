import {Component, OnInit, OnDestroy} from '@angular/core';
import * as echarts from 'echarts';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import { environment } from '../../app.module';

interface PersonalInfo {
  name: string;
  login: string;
  class: string;
  time : number;
  number: number;
  say: string;
}

@Component({
  selector: 'app-personal-center',
  templateUrl: './personal-center.component.html',
  styleUrls: ['./personal-center.component.css']
})
export class PersonalCenterComponent implements OnInit, OnDestroy {
  currentChart: echarts.ECharts | null = null;
  personalInfo: PersonalInfo | null = null;
  showTable = false;
  showForm = false;
  showChart = true;
  showContent = false;

  constructor(public http: HttpClient) {
  }

  ngOnInit() {
    document.title = "个人中心";
  }


  ngOnDestroy() {
    // 在组件销毁时销毁当前的图表实例
    if (this.currentChart) {
      this.currentChart.dispose();
      this.currentChart = null;
    }
  }


  logout() {
    const flag = confirm("确认退出登录？");
    if (flag) {
      localStorage.setItem("token", "");
      window.location.href = '/index';
    }
  }

  loadLineChart() {
    if (this.currentChart) {
      this.currentChart.dispose();
      this.currentChart = null;
    }
    this.showTable = false;
    this.showForm = false;
    this.showChart = true;
    this.showContent = false;
    let lineData = {
      lineValue:[2, 3, 0, 5, 7, 0, 10],
    };
    const chartDom = document.getElementById('chart')!;
    this.currentChart = echarts.init(chartDom);
    const httpOptions = {
      headers: new HttpHeaders({'Content-Type': 'application/json', token: localStorage.getItem('token')!})
    };
    const api = environment.apiPrefix + "/user/chart/line";

    this.http.get(api, httpOptions).subscribe((res: any) => {
        if (res.success) {
          lineData = res.data;
        } else {
          alert("获取该课程信息失败");
        }
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
              data: lineData.lineValue,
              type: 'line'
            }
          ]
        };
        // @ts-ignore
        this.currentChart.setOption(option);
      },
      (error: any) => {
        // Error handling when API request fails
        console.error("API request failed:", error);
        // Use default data to display the chart
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
              data: lineData.lineValue,
              type: 'line'
            }
          ]
        };

        // @ts-ignore
        this.currentChart.setOption(option);
      });
  }


  loadPieChart() {
    if (this.currentChart) {
      this.currentChart.dispose();
      this.currentChart = null;
    }
    this.showTable = false;
    this.showForm = false;
    this.showChart = true;
    this.showContent = false;
    let pieData = {
      pieValue:[
        {value: 60, name: '高等数学'},
        {value: 55, name: 'c++'},
        {value: 300, name: '日本文化'},
        {value: 30, name: '虚拟现实'},
        {value: 9, name: '诗词赏析'}
      ],
    };
    const chartDom = document.getElementById('chart')!;
    this.currentChart = echarts.init(chartDom);
    const httpOptions = {
      headers: new HttpHeaders({'Content-Type': 'application/json', token: localStorage.getItem('token')!})
    };
    const api = environment.apiPrefix + "/user/chart/pie";

    this.http.get(api, httpOptions).subscribe((res: any) => {
        if (res.success) {
          pieData = res.data;
        } else {
          alert("获取该课程信息失败");
        }
        const option = {
          title: {
            text: '发言次数',
            subtext: '仅含上课时间数据',
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
              name: 'class data',
              type: 'pie',
              radius: '50%',
              data: pieData.pieValue,
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

        // @ts-ignore
        this.currentChart.setOption(option);
      },
      (error: any) => {
        // Error handling when API request fails
        console.error("API request failed:", error);
        // Use default data to display the chart
        const option = {
          title: {
            text: '发言次数',
            subtext: '仅含上课时间数据',
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
              name: 'class data',
              type: 'pie',
              radius: '50%',
              data: pieData.pieValue,
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

        // @ts-ignore
        this.currentChart.setOption(option);
      });
  }


  loadRadarChart1() {
    if (this.currentChart) {
      this.currentChart.dispose();
      this.currentChart = null;
    }
    this.showTable = false;
    this.showForm = false;
    this.showChart = true;
    this.showContent = false;
    let radarData = {
      name: "课程1",
      value1: [200, 50, 210, 35, 40, 19],
      value2: [150, 60, 180, 35, 43, 25],
    };
    const chartDom = document.getElementById('chart')!;
    this.currentChart = echarts.init(chartDom);
    const httpOptions = {
      headers: new HttpHeaders({'Content-Type': 'application/json', token: localStorage.getItem('token')!})
    };
    const api = environment.apiPrefix + "/user/chart/radar/class1";

    this.http.get(api, httpOptions).subscribe((res: any) => {
        if (res.success) {
          radarData = res.data;
        } else {
          alert("获取该课程信息失败");
        }
        const option = {
          title: {
            text: radarData.name
          },
          legend: {
            data: ['平均数据', '个人数据']
          },
          radar: {
            indicator: [
              {name: '学习时长', max: 300},
              {name: '成绩', max: 160},
              {name: '活跃度', max: 300},
              {name: '发言次数', max: 38},
              {name: '等级', max: 52},
              {name: '肝度', max: 25}
            ]
          },
          series: [
            {
              name: 'Budget vs spending',
              type: 'radar',
              data: [
                {
                  value: radarData.value1,
                  name: '平均数据'
                },
                {
                  value: radarData.value2,
                  name: '个人数据'
                }
              ]
            }
          ]
        };

        // @ts-ignore
        this.currentChart.setOption(option);
      },
      (error: any) => {
        // Error handling when API request fails
        console.error("API request failed:", error);
        // Use default data to display the chart
        const option = {
          title: {
            text: radarData.name
          },
          legend: {
            data: ['平均数据', '个人数据']
          },
          radar: {
            indicator: [
              {name: '学习时长', max: 300},
              {name: '成绩', max: 160},
              {name: '活跃度', max: 300},
              {name: '发言次数', max: 38},
              {name: '等级', max: 52},
              {name: '肝度', max: 25}
            ]
          },
          series: [
            {
              name: 'Budget vs spending',
              type: 'radar',
              data: [
                {
                  value: radarData.value1,
                  name: '平均数据'
                },
                {
                  value: radarData.value2,
                  name: '个人数据'
                }
              ]
            }
          ]
        };

        // @ts-ignore
        this.currentChart.setOption(option);
      });
  }

  loadRadarChart2() {
    if (this.currentChart) {
      this.currentChart.dispose();
      this.currentChart = null;
    }
    this.showTable = false;
    this.showForm = false;
    this.showChart = true;
    this.showContent = false;
    let radarData = {
      name: "课程2",
      value1: [800, 40, 270, 40, 47, 15],
      value2: [200, 50, 210, 36, 48, 23],
    };
    const chartDom = document.getElementById('chart')!;
    this.currentChart = echarts.init(chartDom);
    const httpOptions = {
      headers: new HttpHeaders({'Content-Type': 'application/json', token: localStorage.getItem('token')!})
    };
    const api = environment.apiPrefix + "/user/chart/radar/class2";

    this.http.get(api, httpOptions).subscribe((res: any) => {
        if (res.success) {
          radarData = res.data;
        } else {
          alert("获取该课程信息失败");
        }
        const option = {
          title: {
            text: radarData.name
          },
          legend: {
            data: ['平均数据', '个人数据']
          },
          radar: {
            indicator: [
              {name: '学习时长', max: 1000},
              {name: '成绩', max: 160},
              {name: '活跃度', max: 300},
              {name: '发言次数', max: 38},
              {name: '等级', max: 52},
              {name: '肝度', max: 25}
            ]
          },
          series: [
            {
              name: 'Budget vs spending',
              type: 'radar',
              data: [
                {
                  value: radarData.value1,
                  name: '平均数据'
                },
                {
                  value: radarData.value2,
                  name: '个人数据'
                }
              ]
            }
          ]
        };

        // @ts-ignore
        this.currentChart.setOption(option);
      },
      (error: any) => {
        // Error handling when API request fails
        console.error("API request failed:", error);
        // Use default data to display the chart
        const option = {
          title: {
            text: radarData.name
          },
          legend: {
            data: ['平均数据', '个人数据']
          },
          radar: {
            indicator: [
              {name: '学习时长', max: 1000},
              {name: '成绩', max: 160},
              {name: '活跃度', max: 300},
              {name: '发言次数', max: 38},
              {name: '等级', max: 52},
              {name: '肝度', max: 25}
            ]
          },
          series: [
            {
              name: 'Budget vs spending',
              type: 'radar',
              data: [
                {
                  value: radarData.value1,
                  name: '平均数据'
                },
                {
                  value: radarData.value2,
                  name: '个人数据'
                }
              ]
            }
          ]
        };

        // @ts-ignore
        this.currentChart.setOption(option);
      });
  }

  loadRadarChart3() {
    if (this.currentChart) {
      this.currentChart.dispose();
      this.currentChart = null;
    }
    this.showTable = false;
    this.showForm = false;
    this.showChart = true;
    this.showContent = false;
    let radarData = {
      name: "课程3",
      value1: [420, 30, 200, 35, 50, 18],
      value2: [500, 140, 280, 26, 42, 21],
    };
    const chartDom = document.getElementById('chart')!;
    this.currentChart = echarts.init(chartDom);
    const httpOptions = {
      headers: new HttpHeaders({'Content-Type': 'application/json', token: localStorage.getItem('token')!})
    };
    const api = environment.apiPrefix + "/user/chart/radar/class3";

    this.http.get(api, httpOptions).subscribe((res: any) => {
        if (res.success) {
          radarData = res.data;
        } else {
          alert("获取该课程信息失败");
        }
        const option = {
          title: {
            text: radarData.name
          },
          legend: {
            data: ['平均数据', '个人数据']
          },
          radar: {
            indicator: [
              {name: '学习时长', max: 1000},
              {name: '成绩', max: 160},
              {name: '活跃度', max: 300},
              {name: '发言次数', max: 38},
              {name: '等级', max: 52},
              {name: '肝度', max: 25}
            ]
          },
          series: [
            {
              name: 'Budget vs spending',
              type: 'radar',
              data: [
                {
                  value: radarData.value1,
                  name: '平均数据'
                },
                {
                  value: radarData.value2,
                  name: '个人数据'
                }
              ]
            }
          ]
        };

        // @ts-ignore
        this.currentChart.setOption(option);
      },
      (error: any) => {
        // Error handling when API request fails
        console.error("API request failed:", error);
        // Use default data to display the chart
        const option = {
          title: {
            text: radarData.name
          },
          legend: {
            data: ['平均数据', '个人数据']
          },
          radar: {
            indicator: [
              {name: '学习时长', max: 1000},
              {name: '成绩', max: 160},
              {name: '活跃度', max: 300},
              {name: '发言次数', max: 38},
              {name: '等级', max: 52},
              {name: '肝度', max: 25}
            ]
          },
          series: [
            {
              name: 'Budget vs spending',
              type: 'radar',
              data: [
                {
                  value: radarData.value1,
                  name: '平均数据'
                },
                {
                  value: radarData.value2,
                  name: '个人数据'
                }
              ]
            }
          ]
        };

        // @ts-ignore
        this.currentChart.setOption(option);
      });
  }



  loadBarChart() {
    if (this.currentChart) {
      this.currentChart.dispose();
      this.currentChart = null;
    }
    this.showTable = false;
    this.showForm = false;
    this.showChart = true;
    this.showContent = false;
    let barData = {
      class: ["课程1", "课程2", "课程3", "课程4", "课程5", "课程6"],
      number: [13, 5, 10, 2, 8, 7]
    };
    const chartDom = document.getElementById('chart')!;
    this.currentChart = echarts.init(chartDom);
    const httpOptions = {
      headers: new HttpHeaders({'Content-Type': 'application/json', token: localStorage.getItem('token')!})
    };
    const api = environment.apiPrefix + "/user/chart/bar";

    this.http.get(api, httpOptions).subscribe((res: any) => {
        if (res.success) {
          barData = res.data;
        } else {
          alert("获取课程信息失败");
        }
        const option = {
          title: {
            text: '课程学习时长'
          },
          xAxis: {
            type: 'category',
            name: '课程名称',
            data: barData.class
          },
          yAxis: {
            name: '时长/h',
            type: 'value'
          },
          series: [
            {
              data: barData.number,
              type: 'bar',
              showBackground: true,
              backgroundStyle: {
                color: 'rgba(180, 180, 180, 0.2)'
              }
            }
          ]
        };

        // @ts-ignore
        this.currentChart.setOption(option);
      },
      (error: any) => {
        // Error handling when API request fails
        console.error("API request failed:", error);
        // Use default data to display the chart
        const option = {
          title: {
            text: '课程学习时长'
          },
          xAxis: {
            type: 'category',
            name: '课程名称',
            data: barData.class
          },
          yAxis: {
            name: '时长/h',
            type: 'value'
          },
          series: [
            {
              data: barData.number,
              type: 'bar',
              showBackground: true,
              backgroundStyle: {
                color: 'rgba(180, 180, 180, 0.2)'
              }
            }
          ]
        };

        // @ts-ignore
        this.currentChart.setOption(option);
      });
  }


  loadInfo(){
    if (this.currentChart) {
      this.currentChart.dispose();
      this.currentChart = null;
    }
    this.showForm = false;
    this.showChart = false;
    this.showContent = true;
    this.personalInfo = {
      name: "默认账号",
      login: "2022-07-15 09:28:52",
      class: "computer",
      time: 50,
      number: 114,
      say: "原神是一款由中国游戏公司miHoYo开发和发行的开放世界动作角色扮演游戏（Action RPG）。" +
        "在原神中，玩家将扮演\"旅行者\"这个角色，探索名为提瓦特（Teyvat）的奇幻世界。提瓦特是一个由七个元素力量统治的神秘世界，每个国家都代表着一个不同的元素，包括风、火、水、雷、冰、岩和草。玩家需要解开提瓦特的谜团，探索各种地区、城镇和神秘的遗迹，与各种角色互动并完成任务。",
    };
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json', token: localStorage.getItem('token')! })
    };
    const api = environment.apiPrefix + "/user/info";

    this.http.get(api, httpOptions).subscribe((res: any) => {
      if (res.success) {
        this.personalInfo = res.data;
      }else{
        alert("获取个人数据失败");
      }
    })
    this.showTable = true;
  }

  loadForm(){
    if (this.currentChart) {
      this.currentChart.dispose();
      this.currentChart = null;
    }
    this.showTable = false;
    this.showForm = true;
    this.showChart = false;
    this.showContent = true;
  }

  handleMenuSelection(menu:string) {
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
      case '课程1':
        this.loadRadarChart1();
        break;
      case '课程2':
        this.loadRadarChart2();
        break;
      case '课程3':
        this.loadRadarChart3();
        break;
      case '账户信息':
        alert("测试中，暂未开放喵~");
        /*this.loadForm();*/
        break;
      case '个人信息':
        this.loadInfo();
        break;
      case '个人主页':
        alert("这里空空如也，请等下再来探索吧~");
        break;
      case '敬请期待':
        alert("神秘内容，敬请期待喵~");
        break;
      default:
        break;
    }
  }
}
