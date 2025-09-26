import { RequestForm } from '../(components)/request-form';
import { Badge } from '../(components)/ui/badge';

export const metadata = {
  title: 'プロ仕上げのご相談 - Quick Colorize'
};

export default function ProRequestPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <Badge>Pro Workflow</Badge>
      <h1 className="text-3xl font-semibold text-white">高画質仕上げのご相談</h1>
      <p className="text-gray-300 text-sm">
        カラー化結果に満足いただけましたら、プロフェッショナルな後処理サービスをご案内します。必要事項をご入力ください。
      </p>
      <RequestForm />
    </div>
  );
}
