import { useListProjects, QueryStatusParameter } from "@workspace/api-client-react";

type StatusValue = (typeof QueryStatusParameter)[keyof typeof QueryStatusParameter];

function parseStatus(value: string | null): StatusValue | undefined {
  if (!value) return undefined;
  return (Object.values(QueryStatusParameter) as string[]).includes(value)
    ? (value as StatusValue)
    : undefined;
}
import { useLocation } from "wouter";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { ListFilters } from "@/components/shared/ListFilters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { format } from "date-fns";
import { Building, Calendar, Banknote } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function ProjectListPage() {
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  
  const q = searchParams.get("q") || undefined;
  const year = searchParams.get("year") ? parseInt(searchParams.get("year")!) : undefined;
  const category = searchParams.get("category") || undefined;
  const status = parseStatus(searchParams.get("status"));
  const page = searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1;
  const pageSize = 12;

  const { data, isLoading, error } = useListProjects({ q, year, category, status, page, pageSize });

  const updateFilters = (key: string, value: any) => {
    const params = new URLSearchParams(window.location.search);
    if (value === undefined || value === "") {
      params.delete(key);
    } else {
      params.set(key, value.toString());
    }
    if (key !== "page") {
      params.set("page", "1");
    }
    setLocation(`?${params.toString()}`);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd.MM.yyyy");
    } catch (e) {
      return dateString;
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'planned': return <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200">Планиран</Badge>;
      case 'ongoing': return <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200">Во тек</Badge>;
      case 'completed': return <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200">Завршен</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-serif font-bold mb-4 flex items-center gap-3">
          <Building className="h-8 w-8 text-primary" /> Проекти
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Инфраструктурни и капитални проекти за развој и унапредување на локалната заедница.
        </p>
      </div>

      <ListFilters
        q={q}
        year={year}
        category={category}
        status={status}
        availableYears={data?.availableYears}
        availableCategories={data?.availableCategories}
        availableStatuses={data?.availableStatuses}
        onFilterChange={updateFilters}
      />

      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState />
      ) : data?.items.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.items.map(item => (
              <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                {item.coverImageUrl && (
                  <div className="aspect-video w-full overflow-hidden bg-muted">
                    <img src={item.coverImageUrl} alt={item.title} className="w-full h-full object-cover transition-transform hover:scale-105 duration-500" />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center justify-between mb-3">
                    {getStatusBadge(item.status)}
                    <span className="bg-muted text-muted-foreground px-2 py-1 rounded-full text-xs font-medium">{item.category}</span>
                  </div>
                  <CardTitle className="line-clamp-2 leading-tight font-serif text-xl">
                    <Link href={`/proekti/${item.id}`} className="hover:text-primary transition-colors">
                      {item.title}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
                  <p className="text-muted-foreground line-clamp-3 text-sm mb-4">{item.summary}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto pt-4 border-t">
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5"/> {formatDate(item.publishedAt)}</span>
                    {item.budget && (
                      <span className="flex items-center gap-1 font-medium text-foreground"><Banknote className="h-3.5 w-3.5 text-primary"/> {item.budget}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {data && (
            <PaginationControls
              page={data.pagination.page}
              totalPages={data.pagination.totalPages}
              onPageChange={(p) => updateFilters("page", p)}
            />
          )}
        </>
      )}
    </div>
  );
}
