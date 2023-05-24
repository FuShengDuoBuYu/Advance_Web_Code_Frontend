export class Message{
  time!: string;
  content!: string;
  username!: string;
  role!: string;
  other!: string;
  type!: string;

  constructor(time: string, content: string, username: string, role: string, other: string, type: string) {
    this.time = time;
    this.content = content;
    this.username = username;
    this.role = role;
    this.other = other;
    this.type = type;
  }
}