import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { XCircle, Warning } from '@phosphor-icons/react'
import { ErrorFrequency } from '@/lib/types'

interface ErrorListProps {
    errors: ErrorFrequency[]
}

export function ErrorList({ errors }: ErrorListProps) {
    if (errors.length === 0) {
        return (
            <Card className="p-8">
                <div className="text-center text-muted-foreground">
                    <p className="font-medium">No errors or warnings found</p>
                    <p className="text-sm mt-1">Your logs look clean!</p>
                </div>
            </Card>
        )
    }

    return (
        <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-error" />
                Top Issues
            </h3>
            <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                    {errors.map((error, index) => (
                        <div key={index}>
                            <div className="flex items-start gap-3">
                                <div className="mt-1">
                                    {error.level === 'ERROR' ? (
                                        <XCircle className="w-5 h-5 text-error" weight="fill" />
                                    ) : (
                                        <Warning className="w-5 h-5 text-warning" weight="fill" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <Badge
                                            variant={error.level === 'ERROR' ? 'destructive' : 'secondary'}
                                            className={error.level === 'WARN' ? 'bg-warning text-warning-foreground' : ''}
                                        >
                                            {error.level}
                                        </Badge>
                                        <span className="text-sm font-bold text-foreground whitespace-nowrap">
                                            {error.count}x
                                        </span>
                                    </div>
                                    <p className="text-sm text-foreground break-words font-mono leading-relaxed">
                                        {error.message}
                                    </p>
                                </div>
                            </div>
                            {index < errors.length - 1 && <Separator className="mt-4" />}
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </Card>
    )
}
