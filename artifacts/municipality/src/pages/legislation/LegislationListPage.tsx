import { useListLegislation } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { ListFilters } from "@/components/shared/ListFilters";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Link } from "wouter";
import { format } from "date-fns";
import { Gavel, Calendar, Download, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LegislationListPage() {
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  
  const q = searchParams.get("q") || undefined;
  const year = searchParams.get("year") ? parseInt(searchParams.get("year")!) : undefined;
  const category = searchParams.get("category") || undefined;
  const page = searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1;
  const pageSize = 12;

  const { data, isLoading, error } = useListLegislation({ q, year, category, page, pageSize });

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
          <Gavel className="h-8 w-8 text-primary" /> Легислатива
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Статут, деловник, правилници, одлуки и други правни акти на општината.
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data?.items.map(item => (
              <Card key={item.id} className="flex flex-col h-full border-l-4 border-l-primary hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-3">
                    <span className="flex items-center gap-1 text-sm font-medium bg-muted text-muted-foreground px-2.5 py-1 rounded-md">
                      <Scale className="h-3.5 w-3.5" /> {item.category}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" /> {formatDate(item.publishedAt)}
                    </span>
                  </div>
                  <CardTitle className="text-xl font-serif">
                    <Link href={`/legislativa/${item.id}`} className="hover:text-primary transition-colors line-clamp-2">
                      {item.title}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-2 flex-1">
                  <p className="text-muted-foreground line-clamp-3 text-sm">{item.summary}</p>
                </CardContent>
                <CardFooter className="pt-4 border-t mt-auto">
                  <Button asChild variant="outline" className="w-full sm:w-auto group">
                    <a href={item.fileUrl} target="_blank" rel="noopener noreferrer">
                      <Download className="mr-2 h-4 w-4 group-hover:-translate-y-1 group-hover:text-primary transition-transform" /> 
                      Преземи PDF
                    </a>
                  </Button>
                  <Button asChild variant="ghost" className="w-full sm:w-auto ml-auto">
                    <Link href={`/legislativa/${item.id}`}>Повеќе детали</Link>
                  </Button>
                </CardFooter>
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
