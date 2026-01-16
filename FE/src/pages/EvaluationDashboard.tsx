import { BarChart3, TrendingUp, Award, DollarSign } from 'lucide-react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../components/ui/Card'
import Button from '../components/ui/Button'

const mockEvaluations = [
  {
    id: 1,
    vendor: 'TechSolutions Inc.',
    rfp: 'CRM Software Development',
    score: 92,
    price: '$125,000',
    timeline: '6 months',
    aiInsight: 'Strong technical capability with proven track record',
  },
  {
    id: 2,
    vendor: 'CloudMasters LLC',
    rfp: 'CRM Software Development',
    score: 88,
    price: '$110,000',
    timeline: '7 months',
    aiInsight: 'Cost-effective solution with competitive pricing',
  },
  {
    id: 3,
    vendor: 'DataViz Pro',
    rfp: 'CRM Software Development',
    score: 85,
    price: '$135,000',
    timeline: '5 months',
    aiInsight: 'Fastest delivery but premium pricing',
  },
]

export default function EvaluationDashboard() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Evaluation Dashboard
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          AI-assisted vendor comparison and proposal analysis
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Proposals Analyzed
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">156</div>
            <p className="mt-1 text-xs text-slate-500">+23% this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Avg. Score
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">87.5</div>
            <p className="mt-1 text-xs text-slate-500">Above industry avg.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Cost Savings
            </CardTitle>
            <DollarSign className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">$2.4M</div>
            <p className="mt-1 text-xs text-slate-500">Through AI insights</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Top Performers
            </CardTitle>
            <Award className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">12</div>
            <p className="mt-1 text-xs text-slate-500">90+ score vendors</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Evaluation */}
      <Card>
        <CardHeader>
          <CardTitle>Active Evaluation: CRM Software Development</CardTitle>
          <CardDescription>
            3 proposals received • AI-powered scoring completed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockEvaluations.map((evaluation, index) => (
              <div
                key={evaluation.id}
                className="rounded-lg border border-slate-200 p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-lg font-bold text-white">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {evaluation.vendor}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          {evaluation.aiInsight}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-xs text-slate-500">AI Score</div>
                        <div className="mt-1 text-lg font-bold text-slate-900">
                          {evaluation.score}/100
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">
                          Proposed Cost
                        </div>
                        <div className="mt-1 text-lg font-bold text-slate-900">
                          {evaluation.price}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Timeline</div>
                        <div className="mt-1 text-lg font-bold text-slate-900">
                          {evaluation.timeline}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    <Button variant="ghost" size="sm">
                      Compare
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            AI Insights & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="rounded-lg bg-blue-50 p-4">
              <p className="text-sm text-slate-900">
                <span className="font-semibold">Best Value:</span> CloudMasters
                LLC offers the most competitive pricing while maintaining high
                quality standards.
              </p>
            </div>
            <div className="rounded-lg bg-emerald-50 p-4">
              <p className="text-sm text-slate-900">
                <span className="font-semibold">Top Performer:</span>{' '}
                TechSolutions Inc. has the highest technical score and excellent
                past project reviews.
              </p>
            </div>
            <div className="rounded-lg bg-amber-50 p-4">
              <p className="text-sm text-slate-900">
                <span className="font-semibold">Fastest Delivery:</span> DataViz
                Pro can complete the project in 5 months, 1-2 months faster than
                competitors.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
