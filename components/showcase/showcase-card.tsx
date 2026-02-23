import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"

interface ShowcaseCardProps {
  title: string
  description?: string
  children: React.ReactNode
}

export function ShowcaseCard({
  title,
  description,
  children,
}: ShowcaseCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
