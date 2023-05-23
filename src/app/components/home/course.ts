export class Course{
  courseId!: number;
  courseName!: string;
  courseDescription!: string;
  building!: string;
  isOver!: number;
  teacher!: Teacher;

  constructor(courseId: number, courseName: string, courseDescription: string, building: string, isOver: number, teacher: Teacher){
    this.courseId = courseId;
    this.courseName = courseName;
    this.courseDescription = courseDescription;
    this.building = building;
    this.isOver = isOver;
    this.teacher = teacher;
  }
}

export class Teacher{
  userId!: number;
  username!: string;
  role!: number;
  constructor(userId: number, username: string, role: number){
    this.userId = userId;
    this.username = username;
    this.role = role;
  }
}