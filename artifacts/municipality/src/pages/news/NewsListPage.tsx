import { useListNews } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { ListFilters } from "@/components/shared/ListFilters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { format } from "date-fns";
import { Calendar } from "lucide-react";

export function NewsListPage() {
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  
  const q = searchParams.get("q") || undefined;
  const year = searchParams.get("year") ? parseInt(searchParams.get("year")!) : undefined;
  const category = searchParams.get("category") || undefined;
  const page = searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1;
  const pageSize = 12;

  const { data, isLoading, error } = useListNews({ q, year, category, page, pageSize });

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
        <h1 className="text-4xl font-serif font-bold mb-4">Новости</h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Следете ги најновите случувања, настани и одлуки од нашата општина.
        </p>
      </div>

      <ListFilters
        q={q}
        year={year}
        category={category}
        availableYears={data?.availableYears}
        availableCategories={data?.availableCategories}
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
            {data?.items.map(news => (
              <Card key={news.id} className="overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                {news.coverImageUrl && (
                  <div className="aspect-video w-full overflow-hidden bg-muted">
                    <img src={news.coverImageUrl} alt={news.title} className="w-full h-full object-cover transition-transform hover:scale-105 duration-500" />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">{news.category}</span>
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3"/> {formatDate(news.publishedAt)}</span>
                  </div>
                  <CardTitle className="line-clamp-2 leading-tight">
                    <Link href={`/novosti/${news.id}`} className="hover:text-primary transition-colors">
                      {news.title}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-muted-foreground line-clamp-3 text-sm">{news.summary}</p>
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
