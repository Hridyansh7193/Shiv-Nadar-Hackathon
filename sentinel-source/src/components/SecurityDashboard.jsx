import { motion } from "framer-motion";
import {
  Shield,
  ArrowLeft,
  Package,
  Clock,
  FileJson,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ScoreMeter from "./ScoreMeter";
import RiskCards from "./RiskCards";
import DependencyTable from "./DependencyTable";

export default function SecurityDashboard({ data, onReset }) {
  const { score, dependencies = [], analyzed_at, file_name } = data;
  console.log("DASHBOARD DEPENDENCIES:", dependencies);

  return (
    <div className="min-h-screen bg-grid">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-cyber-blue/3 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-[600px] h-[600px] bg-cyber-purple/3 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-cyber-blue" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyber-blue to-cyber-green bg-clip-text text-transparent">
              Sentinel Source
            </h1>
          </div>
          <Button
            variant="outline"
            onClick={onReset}
            className="border-border/50 hover:bg-muted/50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            New Scan
          </Button>
        </motion.div>

        {/* Meta info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-4 mb-8 text-sm text-muted-foreground"
        >
          {file_name && (
            <div className="flex items-center gap-1.5">
              <FileJson className="w-4 h-4" />
              <span>{file_name}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Package className="w-4 h-4" />
            <span>{dependencies.length} dependencies analyzed</span>
          </div>
          {analyzed_at && (
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{new Date(analyzed_at).toLocaleString()}</span>
            </div>
          )}
        </motion.div>

        {/* Score + Risk Cards row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Score Meter */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm h-full flex items-center justify-center py-8">
              <ScoreMeter score={score ?? 0} />
            </Card>
          </motion.div>

          {/* Risk Cards */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <RiskCards dependencies={dependencies} />

            {/* Summary Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                <CardContent className="p-5">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {dependencies.length}
                      </p>
                      <p className="text-xs text-muted-foreground">Total Deps</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-cyber-green">
                        {Number(score ?? 0).toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Security Score
                      </p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-cyber-red">
                        {
                          dependencies.filter((d) => {
                            const l = d.risk_level?.toLowerCase();
                            return l === "high" || l === "critical";
                          }).length
                        }
                      </p>
                      <p className="text-xs text-muted-foreground">Threats</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-cyber-yellow">
                        {
                          dependencies.filter((d) => {
                            const l = d.risk_level?.toLowerCase();
                            return l === "medium" || l === "suspicious";
                          }).length
                        }
                      </p>
                      <p className="text-xs text-muted-foreground">Warnings</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Dependency Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="w-5 h-5 text-cyber-blue" />
                Dependency Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <DependencyTable dependencies={dependencies} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center text-xs text-muted-foreground/50"
        >
          Sentinel Source — AI-Powered Dependency Security Analysis
        </motion.p>
      </div>
    </div>
  );
}
