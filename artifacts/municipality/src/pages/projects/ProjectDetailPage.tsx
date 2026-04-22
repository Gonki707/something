import { useGetProject, getGetProjectQueryKey } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Tag, Banknote, Building } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export function ProjectDetailPage() {
  const params = useParams();
  const id = params.id ? parseInt(params.id) : 0;

  const { data: project, isLoading, error } = useGetProject(id, {
    query: { enabled: !!id, queryKey: getGetProjectQueryKey(id) }
  });

  if (isLoading) return <LoadingState />;
  if (error || !project) return <ErrorState message="Проектот не е пронајден." />;

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd.MM.yyyy");
    } catch (e) {
      return dateString;
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'planned': return <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200 text-sm py-1 px-3">Планиран</Badge>;
      case 'ongoing': return <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200 text-sm py-1 px-3">Во тек</Badge>;
      case 'completed': return <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200 text-sm py-1 px-3">Завршен</Badge>;
      default: return <Badge variant="outline" className="text-sm py-1 px-3">{status}</Badge>;
    }
  };

  return (
    <article className="container mx-auto px-4 md:px-8 py-12 max-w-4xl">
      <Button variant="ghost" asChild className="mb-8 -ml-4 text-muted-foreground hover:text-foreground">
        <Link href="/proekti"><ArrowLeft className="mr-2 h-4 w-4" /> Назад кон проекти</Link>
      </Button>

      <div className="space-y-8">
        <div className="flex flex-wrap items-center gap-4">
          {getStatusBadge(project.status)}
          <span className="flex items-center gap-1.5 bg-muted text-muted-foreground px-3 py-1 rounded-full font-medium text-sm">
            <Tag className="h-3.5 w-3.5" /> {project.category}
          </span>
        </div>

        <h1 className="text-3xl md:text-5xl font-serif font-bold text-foreground leading-tight flex items-start gap-3">
          <Building className="h-8 w-8 md:h-10 md:w-10 text-primary mt-1 flex-shrink-0" />
          {project.title}
        </h1>

        <p className="text-xl text-muted-foreground leading-relaxed font-medium">
          {project.summary}
        </p>

        <div className="flex flex-wrap items-center gap-6 p-4 bg-muted/30 rounded-xl border">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-5 w-5 text-primary" /> 
            <div>
              <div className="text-xs uppercase tracking-wider font-medium">Објавено</div>
              <div className="font-medium text-foreground">{formatDate(project.publishedAt)}</div>
            </div>
          </div>
          {project.budget && (
            <div className="flex items-center gap-2 text-muted-foreground ml-auto">
              <Banknote className="h-5 w-5 text-emerald-600" /> 
              <div>
                <div className="text-xs uppercase tracking-wider font-medium">Буџет</div>
                <div className="font-bold text-foreground text-lg">{project.budget}</div>
              </div>
            </div>
          )}
        </div>

        {project.coverImageUrl && (
          <div className="w-full aspect-[21/9] rounded-xl overflow-hidden my-8 shadow-sm">
            <img src={project.coverImageUrl} alt={project.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-serif prose-a:text-primary mt-8">
          <div dangerouslySetInnerHTML={{ __html: project.body.replace(/\n/g, '<br/>') }} />
        </div>
      </div>
    </article>
  );
}
