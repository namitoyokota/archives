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
    public partial class PaymentMethods : Form
    {
        List<PAYMENT> payments = new List<PAYMENT>();
        public PaymentMethods()
        {
            InitializeComponent();
            LoadAll();
            DisplayPayments();
        }

        private void button3_Click(object sender, EventArgs e)
        {
            this.Close();
        }

        private void button_new_payment_Click(object sender, EventArgs e)
        {
            NewPayment form = new NewPayment();
            form.ShowDialog();
            this.Close();
        }
        private void LoadAll()
        {
            string connectionString = System.Configuration.ConfigurationManager.ConnectionStrings["Default"].ConnectionString;
            using (SqlConnection _con = new SqlConnection(connectionString))
            {
                string queryStatement = "SELECT * FROM [GROCERYBAMA1].[dbo].[payment] where username = @username";

                using (SqlCommand _cmd = new SqlCommand(queryStatement, _con))
                {
                    //MessageBox.Show(Globals.Persistent_Current.username);
                    _cmd.Parameters.Add("@username", SqlDbType.VarChar).Value = Globals.Persistent_Current.username;
                    DataTable tb = new DataTable();

                    SqlDataAdapter _dap = new SqlDataAdapter(_cmd);

                    _con.Open();
                    _dap.Fill(tb);
                    _con.Close();
                    foreach (DataRow dr in tb.Rows)
                    {
                        PAYMENT addUser = new PAYMENT();
                        addUser.username = dr["username"].ToString();
                        addUser.payment_name = dr["payment_name"].ToString();
                        addUser.routing_number = dr["routing_number"].ToString();
                        addUser.account_number = dr["account_number"].ToString();
                        payments.Add(addUser);
                    }
                }
            }
        }
        private void DisplayPayments()
        {
            if (!payments.Any())
            {
                textListPayments.Text = "You do not have any saved payments.";
            }
            foreach(var item in payments)
            {
                bool isPreferred = false;
                if (Globals.Preferred_Routing == item.routing_number && Globals.Preferred_Credit == item.account_number)
                {
                    isPreferred = true;
                }
                textListPayments.AppendText(String.Format("Payment Name: {0} | Account Number: {1} | Routing Number: {2} | Default: {3}",
                   item.payment_name, item.account_number, item.routing_number, isPreferred.ToString().ToUpper()));
                textListPayments.AppendText(Environment.NewLine);
                textListPayments.AppendText(Environment.NewLine);
            }
        }
    }
}
