import { useGetNews, getGetNewsQueryKey } from "@workspace/api-client-react";
import { useParams } from "wouter";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
import { format } from "date-fns";

export function NewsDetailPage() {
  const params = useParams();
  const id = params.id ? parseInt(params.id) : 0;

  const { data: news, isLoading, error } = useGetNews(id, {
    query: { enabled: !!id, queryKey: getGetNewsQueryKey(id) }
  });

  if (isLoading) return <LoadingState />;
  if (error || !news) return <ErrorState message="Веста не е пронајдена." />;

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
        <Link href="/novosti"><ArrowLeft className="mr-2 h-4 w-4" /> Назад кон новости</Link>
      </Button>

      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
            <Tag className="h-3.5 w-3.5" /> {news.category}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" /> {formatDate(news.publishedAt)}
          </span>
        </div>

        <h1 className="text-3xl md:text-5xl font-serif font-bold text-foreground leading-tight">
          {news.title}
        </h1>

        <p className="text-xl text-muted-foreground leading-relaxed font-medium">
          {news.summary}
        </p>

        {news.coverImageUrl && (
          <div className="w-full aspect-[2/1] rounded-xl overflow-hidden my-8">
            <img src={news.coverImageUrl} alt={news.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-serif prose-a:text-primary">
          {/* Simple render since we don't have a rich text renderer, we assume plain text or simple HTML */}
          <div dangerouslySetInnerHTML={{ __html: news.body.replace(/\n/g, '<br/>') }} />
        </div>
      </div>
    </article>
  );
}
