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
    public partial class ManagerFunctionality : Form
    {
        public ManagerFunctionality()
        {
            InitializeComponent();
        }

        // REVENUE REPORT VVVVVV

        private void button5_Click(object sender, EventArgs e)
        {
            string connectionString = System.Configuration.ConfigurationManager.ConnectionStrings["Default"].ConnectionString;
            using (SqlConnection _con = new SqlConnection(connectionString))
            {
                string queryStatement = @"SELECT store_name, SUM((wholesale_price - listed_price)*s.quantity) as total_profit, SUM(s.quantity) as items_sold from selectItem s 
	                                    inner join Orderr o on s.order_id = o.order_id 
	                                    inner join orderFrom orf on orf.order_id = o.order_id 
	                                    inner join item i on s.item_id = i.item_id 
	                                    inner join grocerystore g on g.store_id = orf.store_address_id 
	                                    where store_address_id = @store_id
	                                    group by store_name";

                using (SqlCommand _cmd = new SqlCommand(queryStatement, _con))
                {
                    DataTable tb = new DataTable();

                    _cmd.Parameters.Add("@store_id", SqlDbType.VarChar).Value = Globals.Persistent_Store.store_id;
                    string display = "";

                    SqlDataAdapter _dap = new SqlDataAdapter(_cmd);

                    _con.Open();
                    _dap.Fill(tb);
                    _con.Close();
                    foreach (DataRow dr in tb.Rows)
                    {
                        display += "Store Name: " + dr["store_name"] + "\nTotal Profit: " + dr["total_profit"] + "\nItems Sold: " + dr["items_sold"];
                        MessageBox.Show(display, "Revenue Report");
                    }
                }
            }
        }

        private void button_back_Click(object sender, EventArgs e)
        {
            this.Close();
        }

        private void button_accountInfo_Click(object sender, EventArgs e)
        {
            ManagerAccountInformation form = new ManagerAccountInformation();
            form.ShowDialog();
        }

        private void button_orders_Click(object sender, EventArgs e)
        {
            ViewOutstanding form = new ViewOutstanding();
            form.ShowDialog();
        }

        private void button_store_Click(object sender, EventArgs e)
        {
            ViewInventory form = new ViewInventory();
            form.ShowDialog();
        }
    }
}
