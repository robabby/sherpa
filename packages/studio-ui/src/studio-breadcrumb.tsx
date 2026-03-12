import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Fragment } from "react";

interface StudioBreadcrumbProps {
  segments: { label: string; href?: string }[];
}

export function StudioBreadcrumb({ segments }: StudioBreadcrumbProps) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Studio</BreadcrumbLink>
        </BreadcrumbItem>
        {segments.map((seg, i) => (
          <Fragment key={i}>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {i === segments.length - 1 ? (
                <BreadcrumbPage>{seg.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={seg.href}>{seg.label}</BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
