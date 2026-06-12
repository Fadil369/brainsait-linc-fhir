/// BrainSAIT Master Unified Production
/// Orchestrates all LINC AI agents and healthcare services
Class brainsait.Production.MasterUnified Extends Ens.Production
{

XData ProductionDefinition
{
<Production Name="brainsait.Production.MasterUnified" TestingEnabled="true" LogGeneralTraceEvents="true">
  <Description>BrainSAIT Unified AI Healthcare Production — 12 Contest Agents, FHIR R4, NPHIES, Bilingual</Description>
  <ActorPoolSize>2</ActorPoolSize>

  <!-- Master Orchestrator -->
  <Item Name="MASTERLINC" ClassName="brainsait.Production.MASTERLINC" Enabled="true" PoolSize="1">
    <Setting Target="Host" Name="TargetConfigNames">ClaimLinc,ClinicalLinc,ComplianceLinc,DocuLinc,RadioLinc,HealthcareLinc,TTLinc,ContextLinc,OracleBridge</Setting>
  </Item>

  <!-- Core LINC Services -->
  <Item Name="ClaimLinc" ClassName="brainsait.Production.CLAIMLINC" Enabled="true" PoolSize="1" />
  <Item Name="ClinicalLinc" ClassName="brainsait.Production.CLINICALLINC" Enabled="true" PoolSize="1" />
  <Item Name="ComplianceLinc" ClassName="brainsait.Production.COMPLIANCELINC" Enabled="true" PoolSize="1" />
  <Item Name="DocuLinc" ClassName="brainsait.Production.DOCULINC" Enabled="true" PoolSize="1" />
  <Item Name="RadioLinc" ClassName="brainsait.Production.RADIOLINC" Enabled="true" PoolSize="1" />
  <Item Name="HealthcareLinc" ClassName="brainsait.Production.HEALTHCARELINC" Enabled="true" PoolSize="1" />
  <Item Name="TTLinc" ClassName="brainsait.Production.TTLINC" Enabled="true" PoolSize="1" />
  <Item Name="ContextLinc" ClassName="brainsait.Production.CONTEXTLINC" Enabled="true" PoolSize="1" />
  <Item Name="OracleBridge" ClassName="brainsait.Production.ORACLEBRIDGE" Enabled="true" PoolSize="1" />

  <!-- 12 Contest AI Agents -->
  <Item Name="SummaryGenerator" ClassName="brainsait.Contest.SummaryGenerator" Enabled="true" PoolSize="1" />
  <Item Name="PriorAuthCopilot" ClassName="brainsait.Contest.PriorAuthCopilot" Enabled="true" PoolSize="1" />
  <Item Name="GapsInCareFinder" ClassName="brainsait.Contest.GapsInCareFinder" Enabled="true" PoolSize="1" />
  <Item Name="MedicationSafety" ClassName="brainsait.Contest.MedicationSafety" Enabled="true" PoolSize="1" />
  <Item Name="CarePlanNavigator" ClassName="brainsait.Contest.CarePlanNavigator" Enabled="true" PoolSize="1" />
  <Item Name="ClinicalTrialMatcher" ClassName="brainsait.Contest.ClinicalTrialMatcher" Enabled="true" PoolSize="1" />
  <Item Name="ReadmissionRisk" ClassName="brainsait.Contest.ReadmissionRisk" Enabled="true" PoolSize="1" />
  <Item Name="TriageAssistant" ClassName="brainsait.Contest.TriageAssistant" Enabled="true" PoolSize="1" />
  <Item Name="ImagingFollowup" ClassName="brainsait.Contest.ImagingFollowup" Enabled="true" PoolSize="1" />
  <Item Name="LabExplainer" ClassName="brainsait.Contest.LabExplainer" Enabled="true" PoolSize="1" />
  <Item Name="NLQueryExplorer" ClassName="brainsait.Contest.NLQueryExplorer" Enabled="true" PoolSize="1" />
  <Item Name="SDOHReferralMatcher" ClassName="brainsait.Contest.SDOHReferralMatcher" Enabled="true" PoolSize="1" />

</Production>
}

}
