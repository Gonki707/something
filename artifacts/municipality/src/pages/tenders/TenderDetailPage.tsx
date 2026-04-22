import { useGetTender, getGetTenderQueryKey } from "@workspace/api-client-react";
import { useParams } from "wouter";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Calendar, Briefcase, Clock, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export function TenderDetailPage() {
  const params = useParams();
  const id = params.id ? parseInt(params.id) : 0;

  const { data: item, isLoading, error } = useGetTender(id, {
    query: { enabled: !!id, queryKey: getGetTenderQueryKey(id) }
  });

  if (isLoading) return <LoadingState />;
  if (error || !item) return <ErrorState message="Огласот не е пронајден." />;

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd.MM.yyyy HH:mm");
    } catch (e) {
      return dateString;
    }
  };

  const isOpen = item.status === 'open';

  return (
    <article className="container mx-auto px-4 md:px-8 py-12 max-w-4xl">
      <Button variant="ghost" asChild className="mb-8 -ml-4 text-muted-foreground hover:text-foreground">
        <Link href="/oglasi"><ArrowLeft className="mr-2 h-4 w-4" /> Назад кон огласи</Link>
      </Button>

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        <div className="border-b bg-muted/30 p-8 md:px-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg text-primary">
                <Briefcase className="h-6 w-6" />
              </div>
              <Badge variant={isOpen ? 'default' : 'secondary'} className="text-sm px-3 py-1">
                {isOpen ? 'Отворен оглас' : 'Затворен оглас'}
              </Badge>
            </div>
            
            <div className="flex flex-col text-sm text-muted-foreground bg-background border px-4 py-2 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4" /> Објавено: {formatDate(item.publishedAt)}
              </div>
              <div className={`flex items-center gap-2 font-medium ${isOpen ? 'text-destructive' : 'text-muted-foreground'}`}>
                {isOpen ? <Clock className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />} 
                Краен рок: {formatDate(item.deadline)}
              </div>
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground leading-tight mb-4">
            {item.title}
          </h1>
          <p className="text-lg text-muted-foreground font-medium">
            {item.summary}
          </p>
        </div>

        <div className="p-8 md:p-12 prose prose-lg dark:prose-invert max-w-none prose-headings:font-serif prose-a:text-primary">
          <div dangerouslySetInnerHTML={{ __html: item.body.replace(/\n/g, '<br/>') }} />
        </div>
      </div>
    </article>
  );
}
