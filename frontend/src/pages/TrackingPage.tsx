import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { trackingService } from '../services/tracking.service';
import { Package, CheckCircle, Clock, XCircle } from 'lucide-react';

export default function TrackingPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (orderNumber) {
      loadOrderTracking();
    }
  }, [orderNumber]);

  const loadOrderTracking = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await trackingService.trackOrder(orderNumber!);
      setOrder(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Order not found');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'CANCELLED':
        return <XCircle className="w-6 h-6 text-red-600" />;
      case 'PENDING':
        return <Clock className="w-6 h-6 text-yellow-600" />;
      default:
        return <Package className="w-6 h-6 text-blue-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const statusSteps = [
    'PENDING',
    'PROCESSING',
    'WASHING',
    'DRYING',
    'IRONING',
    'READY',
    'DELIVERED',
  ];

  const getCurrentStepIndex = (status: string) => {
    return statusSteps.indexOf(status);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Order Tracking
              </h1>
              <p className="text-gray-600">
                Track your laundry order status in real-time
              </p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading order information...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 text-lg font-medium">{error}</p>
                <Link
                  to="/login"
                  className="text-primary-600 hover:text-primary-700 mt-4 inline-block"
                >
                  Go to Login
                </Link>
              </div>
            ) : order ? (
              <div className="space-y-6">
                {/* Order Header */}
                <div className="border-b pb-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Order Number</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {order.orderNumber}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="text-2xl font-bold text-green-600">
                        Rp {order.totalAmount.toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Customer</p>
                      <p className="font-medium">{order.customerName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium">{order.customerPhone || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Order Date</p>
                      <p className="font-medium">
                        {new Date(order.createdAt).toLocaleString('id-ID')}
                      </p>
                    </div>
                    {order.deliveryDate && (
                      <div>
                        <p className="text-sm text-gray-600">Delivery Date</p>
                        <p className="font-medium">
                          {new Date(order.deliveryDate).toLocaleString('id-ID')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Current Status */}
                <div className="text-center">
                  <div className="inline-flex items-center space-x-3 mb-4">
                    {getStatusIcon(order.status)}
                    <span
                      className={`px-4 py-2 rounded-full text-lg font-bold border-2 ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Progress Steps */}
                {order.status !== 'CANCELLED' && (
                  <div className="py-6">
                    <div className="relative">
                      <div className="absolute left-0 top-1/2 h-0.5 w-full bg-gray-200"></div>
                      <div
                        className="absolute left-0 top-1/2 h-0.5 bg-primary-600 transition-all duration-500"
                        style={{
                          width: `${
                            (getCurrentStepIndex(order.status) /
                              (statusSteps.length - 1)) *
                            100
                          }%`,
                        }}
                      ></div>
                      <div className="relative flex justify-between">
                        {statusSteps.map((step, index) => {
                          const isCompleted =
                            getCurrentStepIndex(order.status) >= index;
                          return (
                            <div
                              key={step}
                              className="flex flex-col items-center"
                            >
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                                  isCompleted
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-200 text-gray-600'
                                }`}
                              >
                                {isCompleted ? (
                                  <CheckCircle className="w-5 h-5" />
                                ) : (
                                  <span className="text-xs">{index + 1}</span>
                                )}
                              </div>
                              <span className="text-xs text-gray-600 text-center max-w-[60px]">
                                {step}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Order Items */}
                <div>
                  <h3 className="font-bold text-lg mb-3">Order Items</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                            Service
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                            Quantity
                          </th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">
                            Subtotal
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items.map((item: any, index: number) => (
                          <tr key={index} className="border-t">
                            <td className="py-3 px-4">{item.service}</td>
                            <td className="py-3 px-4">
                              {item.quantity} {item.unit}
                            </td>
                            <td className="py-3 px-4 text-right font-medium">
                              Rp {item.subtotal.toLocaleString('id-ID')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Status History */}
                {order.statusHistory && order.statusHistory.length > 0 && (
                  <div>
                    <h3 className="font-bold text-lg mb-3">Status History</h3>
                    <div className="space-y-3">
                      {order.statusHistory.map((history: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-shrink-0">
                            {getStatusIcon(history.status)}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{history.status}</p>
                            {history.notes && (
                              <p className="text-sm text-gray-600">
                                {history.notes}
                              </p>
                            )}
                          </div>
                          <div className="text-right text-sm text-gray-600">
                            {new Date(history.timestamp).toLocaleString('id-ID')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="text-center pt-6 border-t">
                  <p className="text-gray-600 text-sm">
                    Need help? Contact us at support@laundry.com
                  </p>
                  <Link
                    to="/login"
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium mt-2 inline-block"
                  >
                    Login to Dashboard
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
