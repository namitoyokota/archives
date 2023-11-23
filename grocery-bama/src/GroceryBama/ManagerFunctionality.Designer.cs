namespace GroceryBama
{
    partial class ManagerFunctionality
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            this.button_back = new System.Windows.Forms.Button();
            this.button_revenue = new System.Windows.Forms.Button();
            this.button_accountInfo = new System.Windows.Forms.Button();
            this.button_orders = new System.Windows.Forms.Button();
            this.button_store = new System.Windows.Forms.Button();
            this.label1 = new System.Windows.Forms.Label();
            this.SuspendLayout();
            // 
            // button_back
            // 
            this.button_back.Location = new System.Drawing.Point(359, 386);
            this.button_back.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
            this.button_back.Name = "button_back";
            this.button_back.Size = new System.Drawing.Size(107, 49);
            this.button_back.TabIndex = 33;
            this.button_back.Text = "Back";
            this.button_back.UseVisualStyleBackColor = true;
            this.button_back.Click += new System.EventHandler(this.button_back_Click);
            // 
            // button_revenue
            // 
            this.button_revenue.Location = new System.Drawing.Point(74, 92);
            this.button_revenue.Name = "button_revenue";
            this.button_revenue.Size = new System.Drawing.Size(136, 64);
            this.button_revenue.TabIndex = 32;
            this.button_revenue.Text = "View Revenue Report";
            this.button_revenue.UseVisualStyleBackColor = true;
            this.button_revenue.Click += new System.EventHandler(this.button5_Click);
            // 
            // button_accountInfo
            // 
            this.button_accountInfo.Location = new System.Drawing.Point(590, 92);
            this.button_accountInfo.Name = "button_accountInfo";
            this.button_accountInfo.Size = new System.Drawing.Size(136, 64);
            this.button_accountInfo.TabIndex = 31;
            this.button_accountInfo.Text = "Account Information";
            this.button_accountInfo.UseVisualStyleBackColor = true;
            this.button_accountInfo.Click += new System.EventHandler(this.button_accountInfo_Click);
            // 
            // button_orders
            // 
            this.button_orders.Location = new System.Drawing.Point(74, 176);
            this.button_orders.Name = "button_orders";
            this.button_orders.Size = new System.Drawing.Size(136, 64);
            this.button_orders.TabIndex = 30;
            this.button_orders.Text = "View Outstanding Orders";
            this.button_orders.UseVisualStyleBackColor = true;
            this.button_orders.Click += new System.EventHandler(this.button_orders_Click);
            // 
            // button_store
            // 
            this.button_store.Location = new System.Drawing.Point(590, 176);
            this.button_store.Name = "button_store";
            this.button_store.Size = new System.Drawing.Size(136, 64);
            this.button_store.TabIndex = 29;
            this.button_store.Text = "View Store Inventory";
            this.button_store.UseVisualStyleBackColor = true;
            this.button_store.Click += new System.EventHandler(this.button_store_Click);
            // 
            // label1
            // 
            this.label1.AutoSize = true;
            this.label1.Font = new System.Drawing.Font("Microsoft Sans Serif", 16.2F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.label1.Location = new System.Drawing.Point(242, 15);
            this.label1.Name = "label1";
            this.label1.Size = new System.Drawing.Size(317, 32);
            this.label1.TabIndex = 28;
            this.label1.Text = "Manager Functionality";
            // 
            // ManagerFunctionality
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(8F, 16F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(800, 450);
            this.Controls.Add(this.button_back);
            this.Controls.Add(this.button_revenue);
            this.Controls.Add(this.button_accountInfo);
            this.Controls.Add(this.button_orders);
            this.Controls.Add(this.button_store);
            this.Controls.Add(this.label1);
            this.Name = "ManagerFunctionality";
            this.Text = "ManagerFunctionality";
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.Button button_back;
        private System.Windows.Forms.Button button_revenue;
        private System.Windows.Forms.Button button_accountInfo;
        private System.Windows.Forms.Button button_orders;
        private System.Windows.Forms.Button button_store;
        private System.Windows.Forms.Label label1;
    }
}