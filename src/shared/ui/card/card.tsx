import * as React from "react"
import { cn } from "@/shared/utils/cn"
import CardHeader from "./card-header"
import CardTitle from "./card-title"
import CardDescription from "./card-description"
import CardContent from "./card-content"
import CardFooter from "./card-footer"

const CardRoot = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
))
CardRoot.displayName = "Card"

const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Title: CardTitle,
  Description: CardDescription,
  Content: CardContent,
  Footer: CardFooter,
})

export default Card
