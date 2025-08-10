import React, { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  File, 
  CheckCircle, 
  Clock, 
  Send,
  Download,
  ExternalLink,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DeliveryFormData {
  milestoneId: string;
  title: string;
  description: string;
  notes: string;
}

interface DeliverableFile {
  name: string;
  size: number;
  type: string;
  base64: string;
}

const MilestoneDelivery: React.FC = () => {
  const [formData, setFormData] = useState<DeliveryFormData>({
    milestoneId: '',
    title: '',
    description: '',
    notes: ''
  });

  const [files, setFiles] = useState<DeliverableFile[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [deliveryResult, setDeliveryResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles) return;

    Array.from(selectedFiles).forEach(file => {
      // Check file size (limit to 10MB for demo)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: `${file.name} exceeds 10MB limit`,
          variant: "destructive"
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        const newFile: DeliverableFile = {
          name: file.name,
          size: file.size,
          type: file.type,
          base64: base64.split(',')[1] // Remove data:type;base64, prefix
        };

        setFiles(prev => [...prev, newFile]);
      };
      reader.readAsDataURL(file);
    });

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const simulateUpload = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 30;
      });
    }, 200);
  };

  const handleSubmitDelivery = async () => {
    if (!formData.milestoneId || !formData.title || files.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in milestone ID, title, and upload at least one file",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    simulateUpload();

    try {
      // Simulate file upload to Web3.Storage or IPFS
      // In a real implementation, you would upload to a decentralized storage service
      
      // For demo purposes, we'll simulate the upload process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock IPFS CID
      const mockCID = `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;

      const response = await fetch(`http://localhost:5000/milestones/${formData.milestoneId}/deliver`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          file: mockCID, // In real implementation, this would be the actual uploaded file/CID
          title: formData.title,
          description: formData.description,
          notes: formData.notes
        })
      });

      if (response.ok) {
        const result = await response.json();
        setDeliveryResult({ ...result, cid: mockCID });
        
        toast({
          title: "Success! 🎉",
          description: `Deliverable uploaded successfully. CID: ${mockCID}`,
        });

        // Reset form
        setFormData({
          milestoneId: '',
          title: '',
          description: '',
          notes: ''
        });
        setFiles([]);
      } else {
        const error = await response.json();
        toast({
          title: "Upload Failed",
          description: error.error || "Failed to submit deliverable",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error submitting deliverable:', error);
      toast({
        title: "Error",
        description: "Network error occurred",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  if (deliveryResult) {
    return (
      <div className="container mx-auto px-4 py-8 pt-24 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-6 h-6" />
              Deliverable Submitted Successfully!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="font-medium">Milestone ID</Label>
                <p className="text-lg">{deliveryResult.milestone?.id}</p>
              </div>
              <div>
                <Label className="font-medium">IPFS CID</Label>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm bg-muted p-1 rounded">{deliveryResult.cid}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(`https://ipfs.io/ipfs/${deliveryResult.cid}`, '_blank')}
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>

            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <div className="space-y-2">
                  <p><strong>Next Steps:</strong></p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Your deliverable has been uploaded to decentralized storage</li>
                    <li>The client can now review your submission</li>
                    <li>Once approved, milestone funds will be released to your wallet</li>
                    <li>You'll receive a notification when the milestone is approved</li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>

            <div className="flex gap-4">
              <Button onClick={() => setDeliveryResult(null)}>
                Submit Another Deliverable
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open(`https://ipfs.io/ipfs/${deliveryResult.cid}`, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View on IPFS
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-24 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Submit Milestone Deliverable</h1>
        <p className="text-muted-foreground">
          Upload your completed work and submit it for client review
        </p>
      </div>

      <div className="space-y-6">
        {/* Milestone Information */}
        <Card>
          <CardHeader>
            <CardTitle>Milestone Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="milestone-id">Milestone ID</Label>
              <Input
                id="milestone-id"
                type="number"
                value={formData.milestoneId}
                onChange={(e) => setFormData(prev => ({ ...prev, milestoneId: e.target.value }))}
                placeholder="Enter milestone ID"
              />
            </div>

            <div>
              <Label htmlFor="title">Deliverable Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Brief title for your deliverable"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what you've delivered and how it meets the milestone requirements"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any additional information, instructions, or notes for the client"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* File Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Files</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">Upload Your Deliverables</p>
              <p className="text-sm text-muted-foreground mb-4">
                Click here or drag and drop files to upload
              </p>
              <p className="text-xs text-muted-foreground">
                Supported formats: Images, Documents, Code files, etc. (Max 10MB per file)
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileSelect}
              accept="*/*"
            />

            {files.length > 0 && (
              <div className="space-y-2">
                <Label className="font-medium">Selected Files ({files.length})</Label>
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <File className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)} • {file.type || 'Unknown type'}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading to IPFS...</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submission Guidelines */}
        <Card>
          <CardHeader>
            <CardTitle>Submission Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                <p>Ensure all deliverables meet the milestone requirements outlined in the project</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                <p>Provide clear documentation and instructions if applicable</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                <p>Include source code, design files, or other relevant materials</p>
              </div>
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" />
                <p>Files will be permanently stored on IPFS and cannot be modified after submission</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSubmitDelivery}
            disabled={isUploading || !formData.milestoneId || !formData.title || files.length === 0}
            size="lg"
            className="min-w-32"
          >
            {isUploading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit Deliverable
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MilestoneDelivery;
