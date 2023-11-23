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
    public partial class NewPayment : Form
    {
        public NewPayment()
        {
            InitializeComponent();
        }

        private void button_back_Click(object sender, EventArgs e)
        {
            this.Close();
        }

        private void button_add_Click(object sender, EventArgs e)
        {
            if (String.IsNullOrWhiteSpace(textAccountNumber.Text))
            {
                MessageBox.Show("Please enter an account number.");
                return;
            }

            if (String.IsNullOrWhiteSpace(textPaymentName.Text))
            {
                MessageBox.Show("Please enter a payment name.");
                return;
            }

            if (String.IsNullOrWhiteSpace(textRoutingNumber.Text))
            {
                MessageBox.Show("Please enter a routing number.");
                return;
            }

            if (String.IsNullOrWhiteSpace(comboIsDefault.Text))
            {
                MessageBox.Show("Please select if this payment will be your default.");
                return;
            }
            if(textAccountNumber.Text.Length != 9)
            {
                MessageBox.Show("Invalid account number.");
            }
            if(textRoutingNumber.Text.Length != 9)
            {
                MessageBox.Show("Invalid routing number.");
            }
            string connectionString = System.Configuration.ConfigurationManager.ConnectionStrings["Default"].ConnectionString;
            using (SqlConnection _con = new SqlConnection(connectionString))
            {
                string query = "INSERT INTO [GROCERYBAMA1].[dbo].[PAYMENT] VALUES (@username, @payment_name, @account_number, @routing_number);";
                using (SqlCommand command = new SqlCommand(query, _con))
                {
                    command.Parameters.Add("@username", SqlDbType.VarChar).Value = Globals.Persistent_Current.username;
                    command.Parameters.Add("@payment_name", SqlDbType.VarChar).Value = textPaymentName.Text;
                    command.Parameters.Add("@account_number", SqlDbType.VarChar).Value = textAccountNumber.Text;
                    command.Parameters.Add("@routing_number", SqlDbType.VarChar).Value = textRoutingNumber.Text;
                    _con.Open();
                    int result = command.ExecuteNonQuery();
                    _con.Close();

                    if (result < 0)
                        MessageBox.Show("There was an error.");
                }
            }
            if(comboIsDefault.Text == "Yes")
            {
                Globals.Preferred_Credit = textAccountNumber.Text;
                Globals.Preferred_Routing = textRoutingNumber.Text;
                MessageBox.Show("Successfully added your default payment.");
            }
            else
            {
                MessageBox.Show("Successfully added payment.");
            }
            this.Close();
        }
    }
}
