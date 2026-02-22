import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight, Bot } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

function getRiskVariant(level) {
  const normalized = level?.toLowerCase();
  if (normalized === "low" || normalized === "safe") return "safe";
  if (normalized === "medium" || normalized === "suspicious") return "warning";
  return "danger";
}

function getRiskLabel(level) {
  const normalized = level?.toLowerCase();
  if (normalized === "low" || normalized === "safe") return "Safe";
  if (normalized === "medium" || normalized === "suspicious") return "Suspicious";
  return "High Risk";
}

export default function DependencyTable({ dependencies = [] }) {
  const [expandedRow, setExpandedRow] = useState(null);

  const toggleRow = (index) => {
    setExpandedRow(expandedRow === index ? null : index);
  };

  if (!dependencies.length) return null;

  return (
    <div className="rounded-lg border bg-card/50 backdrop-blur-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-border/50">
            <TableHead className="w-8" />
            <TableHead>Dependency</TableHead>
            <TableHead>Version</TableHead>
            <TableHead>Risk Level</TableHead>
            <TableHead className="text-right">Risk Score</TableHead>
          </TableRow>
        </TableHeader>

        {/* ✅ ONLY ONE tbody */}
        <TableBody>
          {dependencies.map((dep, index) => (
            <>
              {/* Row */}
              <TableRow
                key={dep.name || index}
                className="cursor-pointer hover:bg-muted/30 transition-colors border-border/30"
                onClick={() => toggleRow(index)}
              >
                <TableCell className="w-8 px-3">
                  {expandedRow === index ? (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  )}
                </TableCell>

                <TableCell className="font-medium font-mono text-sm">
                  {dep.name}
                </TableCell>

                <TableCell className="text-muted-foreground text-sm">
                  {dep.version || "N/A"}
                </TableCell>

                <TableCell>
                  <Badge variant={getRiskVariant(dep.risk_level)}>
                    {getRiskLabel(dep.risk_level)}
                  </Badge>
                </TableCell>

                <TableCell className="text-right">
                  <span
                    className="font-mono font-semibold text-sm"
                    style={{
                      color:
                        dep.risk_score >= 70
                          ? "#ff3366"
                          : dep.risk_score >= 40
                          ? "#ffaa00"
                          : "#00ff88",
                    }}
                  >
                    {dep.risk_score ?? "—"}
                  </span>
                </TableCell>
              </TableRow>

              {/* Expandable row */}
              <AnimatePresence>
                {expandedRow === index && dep.explanation && (
                  <TableRow>
                    <TableCell colSpan={5} className="p-0">
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 py-4 bg-muted/20 border-t border-border/20">
                          <div className="flex items-start gap-3">
                            <Bot className="w-5 h-5 text-cyber-blue flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs text-cyber-blue font-medium uppercase tracking-wider mb-1">
                                AI Analysis
                              </p>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {dep.explanation}
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </TableCell>
                  </TableRow>
                )}
              </AnimatePresence>
            </>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}