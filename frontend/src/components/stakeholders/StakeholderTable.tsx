/**
 * StakeholderTable Component
 * Table view of stakeholders with sorting and filtering
 */

import { Stakeholder } from '../../types/stakeholder';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { stakeholderTypeConfigs } from '../../types/stakeholder';
import { Mail, Phone, Eye } from 'lucide-react';

interface StakeholderTableProps {
  stakeholders: Stakeholder[];
  onSelectStakeholder: (stakeholder: Stakeholder) => void;
}

export function StakeholderTable({
  stakeholders,
  onSelectStakeholder
}: StakeholderTableProps) {
  if (stakeholders.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
        <p className="text-gray-500">No stakeholders found</p>
        <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="font-semibold">Name</TableHead>
            <TableHead className="font-semibold">Role</TableHead>
            <TableHead className="font-semibold">Organization</TableHead>
            <TableHead className="font-semibold">Type</TableHead>
            <TableHead className="font-semibold">Region</TableHead>
            <TableHead className="font-semibold">Tags</TableHead>
            <TableHead className="font-semibold text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stakeholders.map((stakeholder) => {
            const typeConfig = stakeholderTypeConfigs[stakeholder.type];

            return (
              <TableRow
                key={stakeholder.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => onSelectStakeholder(stakeholder)}
              >
                <TableCell>
                  <div>
                    <div className="font-medium text-gray-900">{stakeholder.name}</div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        <span className="truncate max-w-[150px]">{stakeholder.email}</span>
                      </div>
                      {stakeholder.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          <span>{stakeholder.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="text-sm text-gray-700">{stakeholder.role}</div>
                </TableCell>

                <TableCell>
                  <div className="text-sm text-gray-700">{stakeholder.organization}</div>
                </TableCell>

                <TableCell>
                  <Badge
                    className="text-xs"
                    style={{
                      backgroundColor: typeConfig.bgColor,
                      color: typeConfig.color,
                      border: `1px solid ${typeConfig.color}40`
                    }}
                  >
                    {typeConfig.icon} {typeConfig.label}
                  </Badge>
                </TableCell>

                <TableCell>
                  <div className="text-sm text-gray-700">{stakeholder.region}</div>
                </TableCell>

                <TableCell>
                  <div className="flex flex-wrap gap-1 max-w-[200px]">
                    {stakeholder.tags.slice(0, 2).map((tag, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="text-xs py-0 px-1.5 h-5"
                      >
                        {tag}
                      </Badge>
                    ))}
                    {stakeholder.tags.length > 2 && (
                      <Badge
                        variant="outline"
                        className="text-xs py-0 px-1.5 h-5 bg-gray-50"
                      >
                        +{stakeholder.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                </TableCell>

                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectStakeholder(stakeholder);
                    }}
                    className="gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
