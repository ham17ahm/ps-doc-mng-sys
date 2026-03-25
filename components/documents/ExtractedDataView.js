'use client';

export default function ExtractedDataView({ data }) {
  if (!data) {
    return <p className="text-gray-500 italic">No extracted data available.</p>;
  }

  const { sender, origin, topic, remarks, language } = data;
  const isRtl = language === 'ur';

  return (
    <div className="space-y-6">

      {/* Sender */}
      <Section title="Sender">
        {sender ? (
          <div className="space-y-2">
            {sender.original && (
              <DualField
                label="Original"
                value={sender.original}
                rtl={isRtl}
              />
            )}
            {sender.english && (
              <DualField label="English" value={sender.english} rtl={false} />
            )}
            {sender.urdu && (
              <DualField label="Urdu" value={sender.urdu} rtl={true} />
            )}
          </div>
        ) : (
          <Empty />
        )}
      </Section>

      {/* Origin */}
      <Section title="Origin / Address">
        {origin ? (
          <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-line" dir={isRtl ? 'rtl' : 'ltr'}>
            {origin}
          </p>
        ) : (
          <Empty />
        )}
      </Section>

      {/* Topic */}
      <Section title="Topic">
        {topic ? (
          <div className="space-y-3">
            {topic.english && (
              <div className="rounded-lg bg-blue-50 border border-blue-100 px-4 py-3">
                <p className="text-xs font-semibold text-blue-400 uppercase tracking-wide mb-1">English</p>
                <p className="text-gray-800 text-sm leading-relaxed">{topic.english}</p>
              </div>
            )}
            {topic.urdu && (
              <div className="rounded-lg bg-purple-50 border border-purple-100 px-4 py-3">
                <p className="text-xs font-semibold text-purple-400 uppercase tracking-wide mb-1">اردو</p>
                <p className="text-gray-800 text-sm leading-relaxed text-right" dir="rtl">{topic.urdu}</p>
              </div>
            )}
          </div>
        ) : (
          <Empty />
        )}
      </Section>

      {/* Remarks */}
      <Section title="Remarks">
        {remarks ? (
          <p className="text-gray-800 text-sm leading-relaxed" dir={isRtl ? 'rtl' : 'ltr'}>
            {remarks}
          </p>
        ) : (
          <Empty />
        )}
      </Section>

    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">{title}</p>
      {children}
    </div>
  );
}

function DualField({ label, value, rtl }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-xs text-gray-400 w-14 flex-shrink-0">{label}</span>
      <span className="text-gray-900 text-sm font-medium" dir={rtl ? 'rtl' : 'ltr'}>
        {value}
      </span>
    </div>
  );
}

function Empty() {
  return <p className="text-sm text-gray-400 italic">Not found in document</p>;
}
