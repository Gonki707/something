import { useListGazette } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { ListFilters } from "@/components/shared/ListFilters";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { BookOpen, Calendar, Download, Hash } from "lucide-react";

export function GazetteListPage() {
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  
  const q = searchParams.get("q") || undefined;
  const year = searchParams.get("year") ? parseInt(searchParams.get("year")!) : undefined;
  const page = searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1;
  const pageSize = 12;

  const { data, isLoading, error } = useListGazette({ q, year, page, pageSize });

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
          <BookOpen className="h-8 w-8 text-primary" /> Службен гласник
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Официјално гласило на општината каде се објавуваат сите донесени одлуки, решенија и прописи.
        </p>
      </div>

      <ListFilters
        q={q}
        year={year}
        availableYears={data?.availableYears}
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
              <Card key={item.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
                <CardHeader className="pb-3 border-b border-border/50">
                  <div className="flex justify-between items-start mb-3">
                    <span className="flex items-center gap-1 text-sm font-medium bg-primary/10 text-primary px-2 py-1 rounded-md">
                      <Hash className="h-3.5 w-3.5" /> Број {item.issueNumber} / {item.year}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" /> {formatDate(item.publishedAt)}
                    </span>
                  </div>
                  <CardTitle className="text-xl font-serif line-clamp-2">
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 flex-1">
                  <p className="text-muted-foreground line-clamp-3 text-sm">{item.summary}</p>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button asChild variant="outline" className="w-full group">
                    <a href={item.fileUrl} target="_blank" rel="noopener noreferrer">
                      <Download className="mr-2 h-4 w-4 group-hover:-translate-y-1 group-hover:text-primary transition-transform" /> 
                      Преземи PDF
                    </a>
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
