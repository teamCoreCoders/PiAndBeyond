import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import Link from 'next/link';

interface ClassCardProps {
  id: string;
  className: string;
  subject: string;
  section: string;
  description: string;
  classCode?: string;
  role: 'teacher' | 'student';
}

export default function ClassCard({
  id,
  className,
  subject,
  section,
  description,
  classCode,
  role,
}: ClassCardProps) {
  const link = role === 'teacher' ? `/teacher/class/${id}` : `/student/class/${id}`;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="text-xl">{className}</CardTitle>
        <CardDescription>
          {subject} - {section}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
        {classCode && (
          <div className="bg-blue-50 p-2 rounded text-center">
            <span className="text-xs text-gray-600">Class Code: </span>
            <span className="font-mono font-bold text-blue-600">{classCode}</span>
          </div>
        )}
        <Link href={link}>
          <Button className="w-full">View Class</Button>
        </Link>
      </CardContent>
    </Card>
  );
}
