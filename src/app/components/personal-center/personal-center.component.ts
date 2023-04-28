import { Component, OnInit } from '@angular/core';
import * as echarts from 'echarts';
import {HttpClient,HttpHeaders} from "@angular/common/http";
import {FormBuilder, Validators} from "@angular/forms";

@Component({
  selector: 'app-personal-center',
  templateUrl: './personal-center.component.html',
  styleUrls: ['./personal-center.component.css']
})
export class PersonalCenterComponent implements OnInit {
  constructor(public http:HttpClient) {
  }

  ngOnInit() {
    let lineData;
    /*sessionStorage.setItem("token",'123456');*/
    type EChartsOption = echarts.EChartsOption;
    const chartDom = document.getElementById('line')!;
    var myChart = echarts.init(chartDom);
    let option: EChartsOption;
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' ,'token':sessionStorage.getItem("token")!})
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
    var myChart2 = echarts.init(chartDom2);
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
    var myChart3 = echarts.init(chartDom3);
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
    var myChart4 = echarts.init(chartDom4);
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


 /* shouldRun = /(^|.)(stackblitz|webcontainer).(io|com)$/.test(window.location.host);*/

}

