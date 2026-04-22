import { useGetAnnouncement, getGetAnnouncementQueryKey } from "@workspace/api-client-react";
import { useParams } from "wouter";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Calendar, Tag, Megaphone } from "lucide-react";
import { format } from "date-fns";

export function AnnouncementDetailPage() {
  const params = useParams();
  const id = params.id ? parseInt(params.id) : 0;

  const { data: item, isLoading, error } = useGetAnnouncement(id, {
    query: { enabled: !!id, queryKey: getGetAnnouncementQueryKey(id) }
  });

  if (isLoading) return <LoadingState />;
  if (error || !item) return <ErrorState message="Соопштението не е пронајдено." />;

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd.MM.yyyy HH:mm");
    } catch (e) {
      return dateString;
    }
  };

  return (
    <article className="container mx-auto px-4 md:px-8 py-12 max-w-4xl">
      <Button variant="ghost" asChild className="mb-8 -ml-4 text-muted-foreground hover:text-foreground">
        <Link href="/soopstenija"><ArrowLeft className="mr-2 h-4 w-4" /> Назад кон соопштенија</Link>
      </Button>

      <div className="bg-card border rounded-xl p-8 md:p-12 shadow-sm">
        <div className="flex flex-col items-center text-center mb-10">
          <div className="bg-primary/10 p-4 rounded-full mb-6 text-primary">
            <Megaphone className="h-8 w-8" />
          </div>
          <div className="flex flex-wrap justify-center items-center gap-4 text-sm text-muted-foreground mb-4">
            <span className="flex items-center gap-1.5 bg-muted px-3 py-1 rounded-full font-medium text-foreground">
              <Tag className="h-3.5 w-3.5" /> {item.category}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" /> Објавено на: {formatDate(item.publishedAt)}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground leading-tight max-w-3xl">
            {item.title}
          </h1>
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-serif prose-a:text-primary border-t pt-8">
          <p className="lead font-medium text-xl text-foreground mb-8">
            {item.summary}
          </p>
          <div dangerouslySetInnerHTML={{ __html: item.body.replace(/\n/g, '<br/>') }} />
        </div>
      </div>
    </article>
  );
}
