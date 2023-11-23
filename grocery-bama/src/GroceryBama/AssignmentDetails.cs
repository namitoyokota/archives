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
    public partial class AssignmentDetails : Form
    {
        struct this_assignment
        {
            public string order_placed_time;
            public string delivery_time;
            public string is_delivered;
            public string house_number;
            public string street;
            public string city;
            public string state;
            public string zip_code;
            public string store_name;
        }
        this_assignment ta = new this_assignment();
        public AssignmentDetails()
        {
            InitializeComponent();
            LoadAll();
            DisplayTA();
        }

        private void button_back_Click(object sender, EventArgs e)
        {
            this.Close();
        }

        private void button_update_status_Click(object sender, EventArgs e)
        {
            int is_delivered = 0;
            if (String.IsNullOrWhiteSpace(comboSelect.Text))
            {
                MessageBox.Show("Please make a selection.");
            }
            if(comboSelect.Text == "Pending")
            {
                is_delivered = 0;
            }
            else if(comboSelect.Text == "Delivered")
            {
                is_delivered = 1;
            }
            string connectionString = System.Configuration.ConfigurationManager.ConnectionStrings["Default"].ConnectionString;
            using (SqlConnection _con = new SqlConnection(connectionString))
            {
                string query = "UPDATE deliveredBy SET is_delivered = @is_delivered WHERE order_id = @order_id";
                using (SqlCommand command = new SqlCommand(query, _con))
                {
                    command.Parameters.Add("@is_delivered", SqlDbType.Bit).Value = is_delivered;
                    command.Parameters.Add("@order_id", SqlDbType.Int).Value = Globals.current_order;
                    _con.Open();
                    int result = command.ExecuteNonQuery();
                    _con.Close();

                    if (result < 0)
                        MessageBox.Show("There was an error.");
                }
            }
            MessageBox.Show("Update successful.");
            this.Close();
        }

        private void button1_Click(object sender, EventArgs e)
        {
            ListMyItems form = new ListMyItems();
            form.ShowDialog();
        }
        private void LoadAll()
        {
            string connectionString = System.Configuration.ConfigurationManager.ConnectionStrings["Default"].ConnectionString;
            using (SqlConnection _con = new SqlConnection(connectionString))
            {
                string queryStatement = @"SELECT order_placed_time, o.delivery_time, is_delivered, house_number, street, city, state, zip_code, store_name FROM[ORDERR] o
                                        INNER JOIN ORDERED_BY c ON c.order_id = o.order_id
                                        INNER JOIN SELECTITEM s ON s.order_id = o.order_id
                                        INNER JOIN ORDERFROM os ON os.order_id = o.order_id
                                        INNER JOIN GROCERYSTORE g ON g.store_id = os.store_address_id
										INNER JOIN BUYER b ON b.username = c.buyer_username
										INNER JOIN Address a ON b.address_id = a.id
                                        INNER JOIN item i ON s.item_id = i.item_id
                                        INNER JOIN deliveredBy d ON d.order_id = o.order_id where o.order_id = @order_id";

                using (SqlCommand _cmd = new SqlCommand(queryStatement, _con))
                {
                    //MessageBox.Show(Globals.Persistent_Current.username);
                    _cmd.Parameters.Add("@order_id", SqlDbType.Int).Value = Int32.Parse(Globals.current_order);
                    DataTable tb = new DataTable();

                    SqlDataAdapter _dap = new SqlDataAdapter(_cmd);

                    _con.Open();
                    _dap.Fill(tb);
                    _con.Close();
                    foreach (DataRow dr in tb.Rows)
                    {
                        ta.city = dr["city"].ToString();
                        ta.delivery_time = dr["delivery_time"].ToString();
                        ta.house_number = dr["house_number"].ToString();
                        ta.is_delivered = dr["is_delivered"].ToString();
                        ta.order_placed_time = dr["order_placed_time"].ToString();
                        ta.state = dr["state"].ToString();
                        ta.store_name = dr["store_name"].ToString();
                        ta.street = dr["street"].ToString();
                        ta.zip_code = dr["zip_code"].ToString();
                    }
                }
            }
        }
        private void DisplayTA()
        {
            textAll.AppendText(String.Format("Order Placed: {0}", ta.order_placed_time));
            textAll.AppendText(Environment.NewLine);
            textAll.AppendText(String.Format("Delivery Time: {0}", ta.delivery_time));
            textAll.AppendText(Environment.NewLine);
            textAll.AppendText(String.Format("Delivered: {0}", ta.is_delivered));
            textAll.AppendText(Environment.NewLine);
            textAll.AppendText(String.Format("Buyer: {0} {1} {2} {3} {4}", ta.house_number, ta.street, ta.city, ta.state, ta.zip_code));
            textAll.AppendText(Environment.NewLine);
            textAll.AppendText(String.Format("Store Name: {0}", ta.store_name));
            textAll.AppendText(Environment.NewLine);
        }

        private void comboSelect_SelectedIndexChanged(object sender, EventArgs e)
        {

        }

        private void label2_Click(object sender, EventArgs e)
        {

        }

        private void textAll_TextChanged(object sender, EventArgs e)
        {

        }

        private void label3_Click(object sender, EventArgs e)
        {

        }
    }
}
