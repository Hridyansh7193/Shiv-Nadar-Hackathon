import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileJson, Shield, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function FileUpload({ onFileUpload, isLoading, error }) {
  const [selectedFile, setSelectedFile] = useState(null);

  const onDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        setSelectedFile(file);
        onFileUpload(file);
      }
    },
    [onFileUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/json": [".json"] },
    maxFiles: 1,
    disabled: isLoading,
  });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-grid">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyber-blue/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyber-purple/5 rounded-full blur-3xl" />
      </div>

      {/* Logo & Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12 relative z-10"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <Shield className="w-12 h-12 text-cyber-blue" />
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyber-blue to-cyber-green bg-clip-text text-transparent">
            Sentinel Source
          </h1>
        </div>
        <p className="text-muted-foreground text-lg">
          The Dependency Firewall — Analyze. Detect. Protect.
        </p>
      </motion.div>

      {/* Upload Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="w-full max-w-xl relative z-10"
      >
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
          <div
            {...getRootProps()}
            className={`
              relative p-12 text-center cursor-pointer transition-all duration-300
              border-2 border-dashed rounded-lg m-4
              ${
                isDragActive
                  ? "border-cyber-blue bg-cyber-blue/5 glow-blue"
                  : "border-border hover:border-cyber-blue/50"
              }
              ${isLoading ? "pointer-events-none opacity-60" : ""}
            `}
          >
            <input {...getInputProps()} />

            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex flex-col items-center gap-4"
                >
                  <Loader2 className="w-16 h-16 text-cyber-blue animate-spin" />
                  <div>
                    <p className="text-lg font-medium text-cyber-blue">
                      Scanning dependencies...
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      AI is analyzing your package for threats
                    </p>
                  </div>
                  {/* Scanning animation bar */}
                  <div className="w-full h-1 bg-secondary rounded-full overflow-hidden mt-2">
                    <motion.div
                      className="h-full bg-gradient-to-r from-cyber-blue to-cyber-green rounded-full"
                      initial={{ x: "-100%" }}
                      animate={{ x: "100%" }}
                      transition={{
                        repeat: Infinity,
                        duration: 1.5,
                        ease: "easeInOut",
                      }}
                      style={{ width: "40%" }}
                    />
                  </div>
                </motion.div>
              ) : selectedFile ? (
                <motion.div
                  key="selected"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex flex-col items-center gap-4"
                >
                  <FileJson className="w-16 h-16 text-cyber-green" />
                  <div>
                    <p className="text-lg font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {(selectedFile.size / 1024).toFixed(1)} KB — Drop another
                      file to replace
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex flex-col items-center gap-4"
                >
                  <div className="relative">
                    <Upload className="w-16 h-16 text-muted-foreground" />
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-cyber-blue/30"
                      animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    />
                  </div>
                  <div>
                    <p className="text-lg font-medium">
                      {isDragActive
                        ? "Drop your package.json here"
                        : "Drag & drop your package.json"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      or click to browse files
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Upload button */}
          {!isLoading && (
            <div className="px-4 pb-4">
              <Button
                className="w-full bg-gradient-to-r from-cyber-blue to-cyber-green text-black font-semibold hover:opacity-90 transition-opacity"
                size="lg"
                onClick={() =>
                  document
                    .querySelector('input[type="file"]')
                    ?.click()
                }
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload package.json
              </Button>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-6 flex items-center gap-2 text-cyber-red bg-cyber-red/10 border border-cyber-red/20 rounded-lg px-4 py-3 max-w-xl w-full relative z-10"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-8 text-xs text-muted-foreground/50 relative z-10"
      >
        Powered by AI threat analysis — Your files are not stored
      </motion.p>
    </div>
  );
}
