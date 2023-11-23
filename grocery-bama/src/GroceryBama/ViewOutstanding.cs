using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Configuration;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.Data.SqlClient;

namespace GroceryBama
{
    public partial class ViewOutstanding : Form
    {
        public ViewOutstanding()
        {
            InitializeComponent();
            LoadAll();
        }

        private void button_back_Click(object sender, EventArgs e)
        {
            this.Close();
        }
        public void LoadAll()
        {
            string connectionString = System.Configuration.ConfigurationManager.ConnectionStrings["Default"].ConnectionString;
            using (SqlConnection _con = new SqlConnection(connectionString))
            {
                string queryStatement = @"SELECT DISTINCT store_name, u1.order_id, order_placed_date, is_delivered, sum_items, total_price, u1.house_number as store_house, u1.street as store_street, u3.house_number as buyer_house, u3.street as buyer_street FROM(

                                        (SELECT DISTINCT store_name, t1.order_id, order_placed_date, is_delivered, sum_items, t1.house_number, t1.street FROM(

                                        (SELECT o.order_id, order_placed_date, store_name, listed_price, s.quantity, is_delivered, a1.house_number, a1.street FROM[ORDERR] o
                                        INNER JOIN ORDERED_BY c ON c.order_id = o.order_id
                                        INNER JOIN SELECTITEM s ON s.order_id = o.order_id
                                        INNER JOIN ORDERFROM os ON os.order_id = o.order_id
                                        INNER JOIN GROCERYSTORE g ON g.store_id = os.store_address_id
										INNER JOIN ADDRESS a1 ON a1.id = g.address_id
                                        INNER JOIN item i ON s.item_id = i.item_id
                                        INNER JOIN deliveredBy d ON d.order_id = o.order_id
                                        WHERE g.store_id = @store_id) t1

										INNER JOIN

                                        (SELECT o2.order_id, SUM(s2.quantity) sum_items FROM[ORDERR] o2
                                        INNER JOIN ORDERED_BY c2 ON c2.order_id = o2.order_id
                                        INNER JOIN SELECTITEM s2 ON s2.order_id = o2.order_id
                                        INNER JOIN ORDERFROM os2 ON os2.order_id = o2.order_id
                                        INNER JOIN GROCERYSTORE g2 ON g2.store_id = os2.store_address_id
                                        INNER JOIN item i2 ON s2.item_id = i2.item_id
                                        INNER JOIN deliveredBy d ON d.order_id = o2.order_id
                                        WHERE g2.store_id = @store_id
                                        GROUP BY o2.order_id) t2 on t1.order_id = t2.order_id)) u1

                                        INNER JOIN

                                        (SELECT o.order_id, SUM(listed_price * s.quantity) as total_price FROM[ORDERR] o
                                        INNER JOIN ORDERED_BY c ON c.order_id = o.order_id
                                        INNER JOIN SELECTITEM s ON s.order_id = o.order_id
                                        INNER JOIN ORDERFROM os ON os.order_id = o.order_id
                                        INNER JOIN GROCERYSTORE g ON g.store_id = os.store_address_id
                                        INNER JOIN item i ON s.item_id = i.item_id
                                        INNER JOIN deliveredBy d ON d.order_id = o.order_id
                                        WHERE store_id = @store_id
                                        GROUP BY o.order_id) u2 on u1.order_id = u2.order_id
										
										INNER JOIN

										(SELECT o3.order_id, a2.house_number, a2.street FROM [ORDERR] o3
										INNER JOIN ORDERED_BY c ON c.order_id = o3.order_id
                                        INNER JOIN SELECTITEM s ON s.order_id = o3.order_id
                                        INNER JOIN ORDERFROM os ON os.order_id = o3.order_id
                                        INNER JOIN GROCERYSTORE g ON g.store_id = os.store_address_id
										INNER JOIN BUYER b ON c.buyer_username = b.username
										INNER JOIN ADDRESS a2 ON a2.id = b.address_id
										INNER JOIN item i ON s.item_id = i.item_id
                                        INNER JOIN deliveredBy d ON d.order_id = o3.order_id
                                        WHERE g.store_id = @store_id) u3 on u1.order_id = u3.order_id
										
										
										) where is_delivered = '0' ORDER BY order_id";

                using (SqlCommand _cmd = new SqlCommand(queryStatement, _con))
                {
                    //MessageBox.Show(Globals.Persistent_Current.username);
                    _cmd.Parameters.Add("@store_id", SqlDbType.Int).Value = Globals.Persistent_Store.store_id;
                    DataTable tb = new DataTable();

                    SqlDataAdapter _dap = new SqlDataAdapter(_cmd);

                    _con.Open();
                    _dap.Fill(tb);
                    _con.Close();
                    foreach (DataRow dr in tb.Rows)
                    {
                        textAll.AppendText(String.Format("Store Name: {0} | Store Address: {1} {2} | Order ID: {3} | Date: {4}", dr["store_name"], dr["store_house"], dr["store_street"], dr["order_id"], dr["order_placed_date"]));
                        textAll.AppendText(Environment.NewLine);
                        textAll.AppendText(String.Format("Total Price: {0} | Total Number of Items: {1} | Delivery Address {2} {3}", dr["total_price"], dr["sum_items"], dr["buyer_house"], dr["buyer_street"]));
                        textAll.AppendText(Environment.NewLine);
                        textAll.AppendText(Environment.NewLine);
                    }
                }
            }
        }
    }
}
