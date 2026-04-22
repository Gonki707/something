import { useListCompetitions, QueryStatusParameter } from "@workspace/api-client-react";

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
import { FileText, Calendar, Clock, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function CompetitionListPage() {
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  
  const q = searchParams.get("q") || undefined;
  const year = searchParams.get("year") ? parseInt(searchParams.get("year")!) : undefined;
  const status = parseStatus(searchParams.get("status"));
  const page = searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1;
  const pageSize = 12;

  const { data, isLoading, error } = useListCompetitions({ q, year, status, page, pageSize });

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

  return (
    <div className="container mx-auto px-4 md:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-serif font-bold mb-4 flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" /> Конкурси
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Стипендии, поддршка за здруженија и други јавни конкурси.
        </p>
      </div>

      <ListFilters
        q={q}
        year={year}
        status={status}
        availableYears={data?.availableYears}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data?.items.map(item => (
              <Card key={item.id} className={`flex flex-col h-full border-t-4 ${item.status === 'open' ? 'border-t-primary' : 'border-t-muted opacity-80'}`}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-3">
                    <Badge variant={item.status === 'open' ? 'default' : 'secondary'} className="font-semibold">
                      {item.status === 'open' ? 'Отворен' : 'Затворен'}
                    </Badge>
                    <div className="flex flex-col items-end text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 mb-1">
                        <Calendar className="h-3 w-3" /> Објавено: {formatDate(item.publishedAt)}
                      </span>
                      <span className={`flex items-center gap-1 font-medium ${item.status === 'open' ? 'text-destructive' : ''}`}>
                        {item.status === 'open' ? <Clock className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />} 
                        Рок: {formatDate(item.deadline)}
                      </span>
                    </div>
                  </div>
                  <CardTitle className="text-xl font-serif">
                    <Link href={`/konkursi/${item.id}`} className="hover:text-primary transition-colors line-clamp-2">
                      {item.title}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-2 flex-1">
                  <p className="text-muted-foreground line-clamp-3 text-sm">{item.summary}</p>
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
