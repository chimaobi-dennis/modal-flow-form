// src/components/TermsModal.tsx
import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

interface ApplicationTermsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAgree: () => void;
    isSubmitting: boolean;
}

export function ApplicationTermsModal({ isOpen, onClose, onAgree, isSubmitting }: ApplicationTermsModalProps) {
    const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    const handleScroll = () => {
        if (contentRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
            const isAtBottom = scrollHeight - scrollTop <= clientHeight + 50;
            setHasScrolledToBottom(isAtBottom);
        }
    };

    return (

        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Application Terms and Conditions</DialogTitle>
                </DialogHeader>

                <div
                    ref={contentRef}
                    onScroll={handleScroll}
                    className="flex-1 overflow-y-auto p-4 border rounded-lg mb-4 text-sm text-gray-700 space-y-4"
                >
                    {/* Terms content here */}
                    <h3 className="font-semibold text-lg mb-2">Application Terms and Conditions</h3>
                    <div className="space-y-4">
                        <p className="mb-4">
                            Please read the terms and conditions carefully before agreeing to them. By clicking on the "Agree and Continue" button, you agree to the terms and conditions.
                        </p>

                        <h4 className="font-semibold text-base mt-6 mb-2">1. Application Process</h4>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>You agree to provide accurate and complete information in the application form.</li>
                            <li>You understand that false or misleading information may result in application rejection.</li>
                            <li>You consent to the collection and processing of your personal data for application purposes.</li>
                        </ul>

                        <h4 className="font-semibold text-base mt-6 mb-2">2. Data Protection</h4>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Your personal data will be processed in accordance with our Privacy Policy.</li>
                            <li>We may share your information with partner institutions for application processing.</li>
                            <li>You have the right to access, correct, or request deletion of your personal data.</li>
                        </ul>

                        <h4 className="font-semibold text-base mt-6 mb-2">3. Application Fees</h4>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Application fees are non-refundable unless otherwise stated.</li>
                            <li>Payment must be made in full before your application can be processed.</li>
                            <li>Additional fees may apply for specific programs or services.</li>
                        </ul>

                        <h4 className="font-semibold text-base mt-6 mb-2">4. Program Requirements</h4>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>You must meet all academic and language requirements for your chosen program.</li>
                            <li>Additional documentation may be requested during the application process.</li>
                            <li>Meeting minimum requirements does not guarantee admission.</li>
                        </ul>

                        <h4 className="font-semibold text-base mt-6 mb-2">5. Terms of Service</h4>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>You agree to use this service for lawful purposes only.</li>
                            <li>We reserve the right to modify these terms at any time.</li>
                            <li>These terms are governed are in accordance with the data related laws of the country of residence of the student.</li>
                        </ul>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={onAgree}
                        disabled={!hasScrolledToBottom || isSubmitting}
                    >
                        {isSubmitting ? 'Submitting...' : 'Agree and Continue'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}