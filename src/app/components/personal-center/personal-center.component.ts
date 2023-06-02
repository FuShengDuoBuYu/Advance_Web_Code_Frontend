import {Component, OnInit, OnDestroy} from '@angular/core';
import * as echarts from 'echarts';
import {HttpClient, HttpHeaders} from "@angular/common/http";

interface PersonalInfo {
  name: string;
  class: string;
  time : number;
  number: number;
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
    this.showTable = false;
    this.showForm = false;
    const chartDom = document.getElementById('pie')!;
    this.currentChart = echarts.init(chartDom);
    const httpOptions = {
      headers: new HttpHeaders({'Content-Type': 'application/json', token: localStorage.getItem('token')!})
    };
    /* const api = '/person/pie';

     this.http.get(api, httpOptions).subscribe((res: any) => {
       if (res.success) {
         const pieData = res.data;*/
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
          name: 'Access From',
          type: 'pie',
          radius: '50%',
          data: [
            {value: 60, name: '高等数学'},
            {value: 55, name: 'c++'},
            {value: 300, name: '日本文化'},
            {value: 30, name: '虚拟现实'},
            {value: 9, name: '诗词赏析'}
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

  loadRadarChart1() {
    if (this.currentChart) {
      this.currentChart.dispose();
      this.currentChart = null;
    }
    this.showTable = false;
    this.showForm = false;
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
        text: '课程1'
      },
      legend: {
        data: ['平均数据', '个人数据']
      },
      radar: {
        indicator: [
          {name: '学习时长', max: 1000},
          {name: '成绩', max: 160},
          {name: '活跃度', max: 300},
          {name: '互动量', max: 38},
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

  loadRadarChart2() {
    if (this.currentChart) {
      this.currentChart.dispose();
      this.currentChart = null;
    }
    this.showTable = false;
    this.showForm = false;
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
        text: '课程2'
      },
      legend: {
        data: ['平均数据', '个人数据']
      },
      radar: {
        indicator: [
          {name: '学习时长', max: 1000},
          {name: '成绩', max: 160},
          {name: '活跃度', max: 300},
          {name: '互动量', max: 38},
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

  loadRadarChart3() {
    if (this.currentChart) {
      this.currentChart.dispose();
      this.currentChart = null;
    }
    this.showTable = false;
    this.showForm = false;
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
        text: '课程3'
      },
      legend: {
        data: ['平均数据', '个人数据']
      },
      radar: {
        indicator: [
          {name: '学习时长', max: 1000},
          {name: '成绩', max: 160},
          {name: '活跃度', max: 300},
          {name: '互动量', max: 38},
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
    this.showTable = false;
    this.showForm = false;
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
        text: '课程学习时长'
      },
      xAxis: {
        type: 'category',
        name: '课程名称',
        data: ['Math', 'English', 'computer', 'science', 'technology', 'history', 'game']
      },
      yAxis: {
        name: '时长/h',
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

  loadInfo(){
    if (this.currentChart) {
      this.currentChart.dispose();
      this.currentChart = null;
    }
    this.showForm = false;
    /*const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json', token: localStorage.getItem('token')! })
    };
    const api = '/person/info';

    this.http.get(api, httpOptions).subscribe((res: any) => {
      if (res.success) {
        this.personalInfo = res.data;
        this.showTable = true;
      }
    })*/
    this.personalInfo = {
      name: "abc",
      class: "computer",
      time: 50,
      number: 88,
    };
    this.showTable = true;
  }

  loadForm(){
    if (this.currentChart) {
      this.currentChart.dispose();
      this.currentChart = null;
    }
    this.showTable = false;
    this.showForm = true;
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
        this.loadForm();
        break;
      case '个人信息':
        this.loadInfo();
        break;
      case '个人主页':

        break;
      case '敬请期待':
        alert("神秘内容，敬请期待喵~");
        break;
      default:
        break;
    }
  }
}
