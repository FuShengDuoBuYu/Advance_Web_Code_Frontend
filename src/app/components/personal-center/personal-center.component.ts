import {Component, OnInit, OnDestroy} from '@angular/core';
import * as echarts from 'echarts';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import { environment } from '../../app.module';
import {userInfo} from "../../type";
import * as imageConversion from "image-conversion";
import {MatDialog} from "@angular/material/dialog";
import {ChangePasswordDialogComponent} from "../change-password-dialog/change-password-dialog.component";
import {ChangeUserinfoDialogComponent} from "../change-userinfo-dialog/change-userinfo-dialog.component";


@Component({
  selector: 'app-personal-center',
  templateUrl: './personal-center.component.html',
  styleUrls: ['./personal-center.component.css']
})
export class PersonalCenterComponent implements OnInit, OnDestroy {
  currentChart: echarts.ECharts | null = null;
  personalInfo: userInfo | null = null;
  showTable = false;
  showForm = true;
  showChart = true;
  showContent = true;
  public role: string | undefined;
  defaultAvatar = "data:image/jpeg;base64,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"
  constructor(public http: HttpClient, public changePasswordDialog: MatDialog, public changePersonInfoDialog: MatDialog) {
    // @ts-ignore
    this.role = localStorage.getItem('role');
  }

  changePersonInfo(){
    this.changePersonInfoDialog.open(ChangeUserinfoDialogComponent, {
      data: {
        username: this.personalInfo?.user_name,
        avatar: this.personalInfo?.avatar == "" ? this.defaultAvatar : this.personalInfo?.avatar
      }
      }
    )

  }

  changePassword(){
    this.changePasswordDialog.open(ChangePasswordDialogComponent, {

    })
  }


  ngOnInit() {
    document.title = "个人中心";
    this.loadInfo();
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
    const api = environment.apiPrefix + "/user/chart/getSevenDaysDuration";

    this.http.get(api, httpOptions).subscribe((res: any) => {
        if (res.success) {
          // lineData = res.data;
          let lineValue = [];
          for (let key in res.data.lineValue) {
            lineValue.push(res.data.lineValue[key]);
          }
          lineData.lineValue = lineValue;
        } else {
          alert("获取该课程信息失败");
        }
        const option = {
          title: {
            text: '近七日学习时长'
          },
          xAxis: {
            type: 'category',
            name: '过去天数',
            data: ['1', '2', '3', '4', '5', '6', '7']
          },
          yAxis: {
            type: 'value',
            name: '学习时长'
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
            text: '近七日学习时长'
          },
          xAxis: {
            type: 'category',
            name: '过去天数',
            data: ['1', '2', '3', '4', '5', '6', '7']
          },
          yAxis: {
            type: 'value',
            name: '学习时长'
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
    const api = environment.apiPrefix + "/user/chart/getCourseChatTimes";

    this.http.get(api, httpOptions).subscribe((res: any) => {
        if (res.success) {
          // pieData = res.data;
          let pieValue = [];
          for (let key in res.data) {
            pieValue.push({
              value: res.data[key],
              name: key
            });
          }
          pieData.pieValue = pieValue;
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
            text: '各课程学习时长',
            subtext: '数据可能存在误差',
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
    const api = environment.apiPrefix + "/user/getConnectDuration";

    this.http.get(api, httpOptions).subscribe((res: any) => {
        console.log(res)
        if (res.success) {
          // transform data format
          let classList = [];
          let numberList = [];
          // 遍历keys
          for (let key in res.data) {
            classList.push(key);
            numberList.push(res.data[key]);
          }
          barData.class = classList;
          barData.number = numberList;
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
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json', token: localStorage.getItem('token')! })
    };
    const api = environment.apiPrefix + "/user/info";

    this.http.get(api, httpOptions).subscribe((res: any) => {
      console.log(res)
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
