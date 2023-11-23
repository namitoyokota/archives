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
    public partial class DelivererAccountInformation : Form
    {
        public DelivererAccountInformation()
        {
            InitializeComponent();
            LoadText();
        }

        private void button_update_Click(object sender, EventArgs e)
        {
            string connectionString = System.Configuration.ConfigurationManager.ConnectionStrings["Default"].ConnectionString;
            using (SqlConnection _con = new SqlConnection(connectionString))
            {
                string query = "UPDATE [User] SET username = @username, password = @password, user_type = 'deliverer', email = @email, first_name = @first_name, last_name = @last_name WHERE username = @old_username";
                using (SqlCommand command = new SqlCommand(query, _con))
                {
                    command.Parameters.Add("@username", SqlDbType.VarChar).Value = Globals.Persistent_Current.username;
                    command.Parameters.Add("@old_username", SqlDbType.VarChar).Value = Globals.Persistent_Current.username;
                    command.Parameters.Add("@password", SqlDbType.VarChar).Value = Globals.Persistent_Current.password;
                    command.Parameters.Add("@email", SqlDbType.VarChar).Value = textEmail.Text;
                    command.Parameters.Add("@first_name", SqlDbType.VarChar).Value = textFirstName.Text;
                    command.Parameters.Add("@last_name", SqlDbType.VarChar).Value = textLastName.Text;
                    _con.Open();
                    int result = command.ExecuteNonQuery();
                    _con.Close();

                    if (result < 0)
                        MessageBox.Show("There was an error.");
                }

                Globals.Persistent_Current.email = textEmail.Text;
                Globals.Persistent_Current.first_name = textFirstName.Text;
                Globals.Persistent_Current.last_name = textLastName.Text;
            }
            MessageBox.Show("Update successful.");
            this.Close();
        }
        private void button_delete_Click(object sender, EventArgs e)
        {
            string connectionString = System.Configuration.ConfigurationManager.ConnectionStrings["Default"].ConnectionString;
            using (SqlConnection _con = new SqlConnection(connectionString))
            {
                string query = "DELETE from [GROCERYBAMA1].[dbo].[USER] where username = @username;";
                using (SqlCommand command = new SqlCommand(query, _con))
                {
                    command.Parameters.Add("@username", SqlDbType.VarChar).Value = Globals.Persistent_Current.username;
                    _con.Open();
                    int result = command.ExecuteNonQuery();
                    _con.Close();

                    if (result < 0)
                        MessageBox.Show("There was an error.");
                }
            }
            Globals.has_deleted = true;
            MessageBox.Show("Delete Successful.");
            this.Close();
        }

        private void button_back_Click(object sender, EventArgs e)
        {
            this.Close();
        }
        private void LoadText()
        {
            textUsername.Text = Globals.Persistent_Current.username;
            textLastName.Text = Globals.Persistent_Current.last_name;
            textEmail.Text = Globals.Persistent_Current.email;
            textFirstName.Text = Globals.Persistent_Current.first_name;
        }
    }
}