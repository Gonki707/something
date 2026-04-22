import { useGetLegislation, getGetLegislationQueryKey } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Tag, Download, Gavel, FileText } from "lucide-react";
import { format } from "date-fns";

export function LegislationDetailPage() {
  const params = useParams();
  const id = params.id ? parseInt(params.id) : 0;

  const { data: legislation, isLoading, error } = useGetLegislation(id, {
    query: { enabled: !!id, queryKey: getGetLegislationQueryKey(id) }
  });

  if (isLoading) return <LoadingState />;
  if (error || !legislation) return <ErrorState message="Актот не е пронајден." />;

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd.MM.yyyy");
    } catch (e) {
      return dateString;
    }
  };

  return (
    <article className="container mx-auto px-4 md:px-8 py-12 max-w-4xl">
      <Button variant="ghost" asChild className="mb-8 -ml-4 text-muted-foreground hover:text-foreground">
        <Link href="/legislativa"><ArrowLeft className="mr-2 h-4 w-4" /> Назад кон легислатива</Link>
      </Button>

      <div className="space-y-8 border-t-8 border-t-primary pt-8 bg-card rounded-xl p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 bg-muted text-muted-foreground px-3 py-1 rounded-full font-medium text-sm uppercase tracking-wide">
            <Tag className="h-3.5 w-3.5" /> {legislation.category}
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground text-sm font-medium">
            <Calendar className="h-4 w-4" /> Донесено на: {formatDate(legislation.publishedAt)}
          </span>
        </div>

        <h1 className="text-3xl md:text-5xl font-serif font-bold text-foreground leading-tight flex items-start gap-3">
          <Gavel className="h-8 w-8 md:h-10 md:w-10 text-primary mt-1 flex-shrink-0" />
          {legislation.title}
        </h1>

        <div className="p-6 bg-muted/50 rounded-lg border-l-4 border-l-secondary">
          <p className="text-xl text-foreground font-medium leading-relaxed">
            {legislation.summary}
          </p>
        </div>

        <div className="flex justify-center my-8">
          <Button asChild size="lg" className="w-full sm:w-auto h-14 text-lg px-8 group">
            <a href={legislation.fileUrl} target="_blank" rel="noopener noreferrer">
              <Download className="mr-3 h-5 w-5 group-hover:-translate-y-1 transition-transform" /> 
              Преземи целосен документ (PDF)
            </a>
          </Button>
        </div>

        <div className="border-t pt-8">
          <h2 className="text-2xl font-serif font-bold mb-6 flex items-center gap-2">
            <FileText className="h-6 w-6 text-muted-foreground" /> Текст на актот
          </h2>
          <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-serif prose-a:text-primary">
            <div dangerouslySetInnerHTML={{ __html: legislation.body.replace(/\n/g, '<br/>') }} />
          </div>
        </div>
      </div>
    </article>
  );
}
